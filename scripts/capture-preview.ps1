# Screenshots preview/out/index.html with headless Microsoft Edge (temporary
# profile) and crops it into one PNG per section in preview/screenshots/.
# Requires the preview server: python -m http.server 5178 --directory preview/out
param([string] $Url = "http://127.0.0.1:5178/", [int] $Width = 1500)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$work = Join-Path $env:TEMP "honeywood-capture"
New-Item -ItemType Directory -Force $work | Out-Null
$full = Join-Path $work "full.png"
if (Test-Path $full) { Remove-Item $full -Confirm:$false }
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") |
  Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "Microsoft Edge not found." }

# Section boundaries (CSS px, measured in the page at 1500px wide).
$sections = [ordered]@{
  "1-python"              = @(197, 1480)
  "2-typescript"          = @(1473, 2917)
  "3-html-css"            = @(2910, 3705)
  "4-syntax-palettes"     = @(3705, 4700)
  "5-layout-quiet-ink"    = @(4781, 5568)
  "6-layout-picture-book" = @(5561, 6356)
  "7-sample-icons"        = @(6356, 6950)
  "8-python-proposals"    = @(6948, 7406)
}
$height = 7410
$p = Start-Process -FilePath $edge -PassThru -Wait -ArgumentList @(
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
  "--user-data-dir=`"$work\edge-profile`"", "--window-size=$Width,$height",
  "--screenshot=`"$full`"", "$Url?nocache=$(Get-Date -Format yyyyMMddHHmmssfff)")
if (-not (Test-Path $full)) { throw "Edge exited ($($p.ExitCode)) without writing a screenshot." }

Add-Type -AssemblyName System.Drawing
$img = [Drawing.Image]::FromFile($full)
Write-Host "full page: $($img.Width) x $($img.Height)"
$out = Join-Path $root "preview\screenshots"
New-Item -ItemType Directory -Force $out | Out-Null
foreach ($k in $sections.Keys) {
  $y0 = $sections[$k][0]; $y1 = [Math]::Min($sections[$k][1], $img.Height); $h = $y1 - $y0
  $bmp = New-Object Drawing.Bitmap $img.Width, $h
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($img, (New-Object Drawing.Rectangle 0, 0, $img.Width, $h), (New-Object Drawing.Rectangle 0, $y0, $img.Width, $h), [Drawing.GraphicsUnit]::Pixel)
  $g.Dispose(); $bmp.Save((Join-Path $out "$k.png"), [Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
  Write-Host "saved preview/screenshots/$k.png"
}
$img.Dispose()
