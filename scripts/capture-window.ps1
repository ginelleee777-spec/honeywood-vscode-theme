# Captures the isolated "Extension Development Host" VS Code window to a PNG
# using PrintWindow (works even if other windows overlap it).
param([Parameter(Mandatory)] [string] $Out, [int] $Width = 1500, [int] $Height = 940)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class Win {
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint flags);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int w, int hgt, uint f);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
[Win]::SetProcessDPIAware() | Out-Null
# Find the isolated preview window by enumerating top-level windows of the
# .preview-profile processes (works even if the window is hidden or not "main").
Add-Type @"
using System; using System.Text; using System.Collections.Generic; using System.Runtime.InteropServices;
public static class FindWin {
  public delegate bool P(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(P p, IntPtr l);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  public static IntPtr ByTitle(HashSet<uint> pids, string part) { IntPtr found = IntPtr.Zero; EnumWindows((h,l)=>{uint p; GetWindowThreadProcessId(h,out p); if(pids.Contains(p)){var s=new StringBuilder(512); GetWindowText(h,s,512); if(s.ToString().Contains(part)){found=h; return false;}} return true;}, IntPtr.Zero); return found; }
}
"@
$pids = New-Object 'System.Collections.Generic.HashSet[uint32]'
Get-CimInstance Win32_Process -Filter "Name='Code.exe'" | Where-Object { $_.CommandLine -like '*preview-profile*' } | ForEach-Object { [void]$pids.Add([uint32]$_.ProcessId) }
$h = [FindWin]::ByTitle($pids, "[Extension Development Host]")
if ($h -eq [IntPtr]::Zero) { throw "No isolated Extension Development Host window found." }
[Win]::ShowWindow($h, 9) | Out-Null            # restore (un-maximise / un-minimise / show)
[Win]::SetWindowPos($h, [IntPtr]::Zero, 40, 40, $Width, $Height, 0x0040) | Out-Null
Start-Sleep -Milliseconds 1200
$r = New-Object Win+RECT
[Win]::GetWindowRect($h, [ref]$r) | Out-Null
$bmp = New-Object Drawing.Bitmap ($r.Right - $r.Left), ($r.Bottom - $r.Top)
$g = [Drawing.Graphics]::FromImage($bmp)
$dc = $g.GetHdc()
[Win]::PrintWindow($h, $dc, 2) | Out-Null       # PW_RENDERFULLCONTENT
$g.ReleaseHdc($dc); $g.Dispose()
New-Item -ItemType Directory -Force (Split-Path -Parent $Out) | Out-Null
$bmp.Save($Out, [Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
Write-Host "saved $Out"
