# Sets the colour theme (and Honeywood icon theme) in the ISOLATED preview
# profile only (.preview-profile/), e.g. to switch themes while the preview window
# is open, or to undo VS Code's first-run dialog resetting the theme.
# Keep this file ASCII-only (Windows PowerShell 5.1).
#   powershell -ExecutionPolicy Bypass -File scripts/set-preview-theme.ps1 -Style quiet-ink
param([ValidateSet("quiet-ink", "picture-book")] [string] $Style = "picture-book")
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$path = Join-Path $root ".preview-profile\user-data\User\settings.json"
if (-not (Test-Path $path)) { throw "No isolated preview profile yet; run scripts/launch-preview.ps1 first." }
$dash = [char]0x2014
$label = @{ "quiet-ink" = "Honeywood $dash Quiet Ink"; "picture-book" = "Honeywood $dash Picture Book" }[$Style]
$settings = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
$settings | Add-Member -Force NoteProperty "workbench.colorTheme" $label
$settings | Add-Member -Force NoteProperty "workbench.iconTheme" "honeywood-icons"
$settings | Add-Member -Force NoteProperty "chat.disableAIFeatures" $true
$settings | Add-Member -Force NoteProperty "git.openRepositoryInParentFolders" "never"
$settings | Add-Member -Force NoteProperty "explorer.autoReveal" $true
$settings | Add-Member -Force NoteProperty "window.newWindowDimensions" "default"
[IO.File]::WriteAllText($path, ($settings | ConvertTo-Json), (New-Object Text.UTF8Encoding $false))
Write-Host "isolated preview profile now uses: $label"
