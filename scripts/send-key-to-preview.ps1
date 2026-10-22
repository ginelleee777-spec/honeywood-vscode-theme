# Posts a key press (default: Escape) to the ISOLATED "Extension Development
# Host" window only, by window handle — no global keyboard input, no focus change.
# Used to dismiss first-run dialogs in the throwaway preview profile.
param([int] $VirtualKey = 0x1B)
$ErrorActionPreference = "Stop"
Add-Type @"
using System; using System.Text; using System.Runtime.InteropServices;
public static class KeyPost {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumChildWindows(IntPtr parent, EnumProc cb, IntPtr l);
  [DllImport("user32.dll")] public static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint msg, IntPtr w, IntPtr l);
  public static int Post(IntPtr top, int vk) {
    int n = 0;
    EnumChildWindows(top, (h, l) => {
      var s = new StringBuilder(256); GetClassName(h, s, 256);
      if (s.ToString() == "Chrome_RenderWidgetHostHWND") {
        PostMessage(h, 0x0100, (IntPtr)vk, (IntPtr)0x00010001);          // WM_KEYDOWN
        PostMessage(h, 0x0101, (IntPtr)vk, unchecked((IntPtr)0xC0010001)); // WM_KEYUP
        n++;
      }
      return true;
    }, IntPtr.Zero);
    return n;
  }
}
"@
$win = Get-Process Code -ErrorAction SilentlyContinue |
  Where-Object { $_.MainWindowTitle -like "[[]Extension Development Host[]]*" } | Select-Object -First 1
if (-not $win) { throw "No Extension Development Host window found." }
$cmd = (Get-CimInstance Win32_Process -Filter "ProcessId=$($win.Id)").CommandLine
if ($cmd -notlike "*preview-profile*") { throw "Refusing: that window is not the isolated preview profile." }
$n = [KeyPost]::Post($win.MainWindowHandle, $VirtualKey)
Write-Host "posted key 0x$('{0:X2}' -f $VirtualKey) to $n render surface(s) of: $($win.MainWindowTitle)"
