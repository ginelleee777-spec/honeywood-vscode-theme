# Renders preview/marketplace-icon/render-<id>.html to a 128x128 PNG with a
# transparent background, using headless Edge with a temporary profile.
#   powershell -ExecutionPolicy Bypass -File scripts/render-marketplace-icon.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dir = Join-Path $root "preview\marketplace-icon"
$work = Join-Path $env:TEMP "honeywood-icon-render"
New-Item -ItemType Directory -Force $work | Out-Null
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") |
  Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "Microsoft Edge not found." }
Add-Type -AssemblyName System.Drawing
foreach ($html in Get-ChildItem $dir -Filter "render-*.html") {
  $id = $html.BaseName -replace "^render-", ""
  $png = Join-Path $dir "option-$id.png"
  if (Test-Path $png) { Remove-Item $png -Confirm:$false }
  $url = "file:///" + ($html.FullName -replace "\\", "/")
  Start-Process -FilePath $edge -Wait -ArgumentList @(
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--force-device-scale-factor=1",
    "--default-background-color=00000000", "--user-data-dir=`"$work\edge-profile`"", "--window-size=128,128",
    "--screenshot=`"$png`"", $url) | Out-Null
  if (-not (Test-Path $png)) { throw "Edge did not write $png" }
  $img = [Drawing.Image]::FromFile($png); $size = "$($img.Width)x$($img.Height)"; $img.Dispose()
  Write-Host "rendered preview/marketplace-icon/option-$id.png ($size)"
}
