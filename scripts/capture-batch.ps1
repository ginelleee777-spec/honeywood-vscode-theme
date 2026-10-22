# Screenshots preview/out/batch-<N>.html with headless Edge (temporary profile)
# and crops it into preview/screenshots/batch-<N>-*.png.
# Requires the preview server: python -m http.server 5178 --directory preview/out
#   powershell -File scripts/capture-batch.ps1 -N 1 -Height 2400 -Cuts "tree:110-600","icons-a:600-1500","icons-b:1500-2400"
param([string] $N = "1", [string] $Page = "", [int] $Height = 2400, [string[]] $Cuts = @("tree:110-600", "icons-a:600-1500", "icons-b:1500-2400"), [int] $Width = 1500)
$ErrorActionPreference = "Stop"
# "powershell -File" passes a list as one comma-joined string; normalise it.
$Cuts = ($Cuts -join ",") -split "," | Where-Object { $_ }
# -Page captures another page in preview/out (e.g. integration); default is batch-<N>.
$name0 = if ($Page) { $Page } else { "batch-$N" }
$root = Split-Path -Parent $PSScriptRoot
$work = Join-Path $env:TEMP "honeywood-capture"
New-Item -ItemType Directory -Force $work | Out-Null
$full = Join-Path $work "$name0.png"
if (Test-Path $full) { Remove-Item $full -Confirm:$false }
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") |
  Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "Microsoft Edge not found." }
$p = Start-Process -FilePath $edge -PassThru -Wait -ArgumentList @(
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--virtual-time-budget=3000",
  "--user-data-dir=`"$work\edge-profile`"", "--window-size=$Width,$Height",
  "--screenshot=`"$full`"", "http://127.0.0.1:5178/$name0.html?nocache=$(Get-Date -Format yyyyMMddHHmmssfff)")
if (-not (Test-Path $full)) { throw "Edge exited ($($p.ExitCode)) without writing a screenshot." }
Add-Type -AssemblyName System.Drawing
$img = [Drawing.Image]::FromFile($full)
$out = Join-Path $root "preview\screenshots"
New-Item -ItemType Directory -Force $out | Out-Null
foreach ($c in $Cuts) {
  $name, $range = $c -split ":"; $y0, $y1 = [int[]]($range -split "-")
  $y1 = [Math]::Min($y1, $img.Height); $h = $y1 - $y0
  $bmp = New-Object Drawing.Bitmap $img.Width, $h
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($img, (New-Object Drawing.Rectangle 0, 0, $img.Width, $h), (New-Object Drawing.Rectangle 0, $y0, $img.Width, $h), [Drawing.GraphicsUnit]::Pixel)
  $g.Dispose(); $bmp.Save((Join-Path $out "$name0-$name.png"), [Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
  Write-Host "saved preview/screenshots/$name0-$name.png"
}
$img.Dispose()
