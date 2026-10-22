# Opens an ISOLATED VS Code window with Honeywood loaded from source.
# Uses its own user-data and extensions folders under .preview-profile/, so
# your everyday VS Code window, settings and extensions are not touched.
# Keep this file ASCII-only: Windows PowerShell 5.1 misreads UTF-8 without BOM.
#
#   npm run vscode:preview                                   # Quiet Ink
#   powershell -ExecutionPolicy Bypass -File scripts/launch-preview.ps1 -Style picture-book
#   powershell -ExecutionPolicy Bypass -File scripts/launch-preview.ps1 -Folder fixtures/icon-gallery -Open @()
param(
  [ValidateSet("quiet-ink", "picture-book")] [string] $Style = "quiet-ink",
  [string] $Folder = "fixtures",
  [string[]] $Open = @("fixtures/src/garden-map.ts", "fixtures/src/reading_log.py", "fixtures/story-card.html")
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

# 1. Do not launch while a VS Code update is pending: a new instance would just
#    wait on this lock (seen as "checkInnoSetupMutex: vscode-updating is held").
$m = $null
if ([Threading.Mutex]::TryOpenExisting("vscode-updating", [ref]$m)) {
  $m.Dispose()
  Write-Host "A VS Code update is still pending, so nothing was launched."
  Write-Host "Finish the update yourself (close VS Code when convenient and reopen it), then run this again."
  exit 2
}

# 2. Locate Code.exe (called directly; code.cmd waits on stdin in some shells).
$exe = @("$env:LOCALAPPDATA\Programs\Microsoft VS Code\Code.exe", "$env:ProgramFiles\Microsoft VS Code\Code.exe") |
  Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $exe) { throw "Code.exe not found." }

# 3. Isolated profile with the preview theme preselected.
$userData = Join-Path $root ".preview-profile\user-data"
$extDir = Join-Path $root ".preview-profile\extensions"
New-Item -ItemType Directory -Force (Join-Path $userData "User"), $extDir | Out-Null
$dash = [char]0x2014
$label = @{ "quiet-ink" = "Honeywood $dash Quiet Ink"; "picture-book" = "Honeywood $dash Picture Book" }[$Style]
$settings = [ordered]@{
  "workbench.colorTheme"                   = $label
  "workbench.iconTheme"                    = "honeywood-icons"
  "workbench.startupEditor"                = "none"
  "workbench.tips.enabled"                 = $false
  "window.restoreWindows"                  = "none"
  "security.workspace.trust.enabled"       = $false
  "telemetry.telemetryLevel"               = "off"
  "update.mode"                            = "none"
  "extensions.autoCheckUpdates"            = $false
  "editor.fontSize"                        = 14
  "editor.minimap.enabled"                 = $false
  "editor.bracketPairColorization.enabled" = $true
  "explorer.compactFolders"                = $false
}
[IO.File]::WriteAllText((Join-Path $userData "User\settings.json"), ($settings | ConvertTo-Json), (New-Object Text.UTF8Encoding $false))

# 4. Launch. Each argument is quoted because the path may contain spaces.
$q = { param($s) '"' + $s + '"' }
$argList = @("--user-data-dir", (& $q $userData), "--extensions-dir", (& $q $extDir),
  "--extensionDevelopmentPath=$(& $q $root)", "--new-window", (& $q (Join-Path $root $Folder))) +
  ($Open | ForEach-Object { & $q (Join-Path $root $_) })
Start-Process -FilePath $exe -ArgumentList $argList | Out-Null
Write-Host "Launched isolated preview window ($Style). Its title starts with [Extension Development Host]."
Write-Host "Switch styles inside it: Ctrl+K Ctrl+T, then pick the other Honeywood theme."
