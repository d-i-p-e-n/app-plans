param(
  [string]$OutputDirectory = "firebase/intellidip/public/assets/brand"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$culture = [System.Globalization.CultureInfo]::InvariantCulture
$fontPath = "C:\Windows\Fonts\BASKVILL.TTF"
$word = "intellidip" # Native i dots are precisely overprinted in amber.
$fontSize = 220.0
$paddingX = 34.0
$paddingTop = 28.0
$paddingBottom = 30.0
$dotRadius = 13.5

$colors = [ordered]@{
  Ink = "#0E1017"
  Ivory = "#FFF8E7"
  Amber = "#F3A30F"
  AmberOnLight = "#B87300"
}

function Format-Number([double]$value) {
  return $value.ToString("0.###", $culture)
}

function ConvertTo-Color([string]$hex) {
  $h = $hex.TrimStart("#")
  $r = [Convert]::ToInt32($h.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($h.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($h.Substring(4, 2), 16)
  return [System.Drawing.Color]::FromArgb(255, $r, $g, $b)
}

function Get-RoundedRectPath([single]$x, [single]$y, [single]$width, [single]$height, [single]$radius) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $radius * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $width - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $width - $d, $y + $height - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $height - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Save-Bitmap([System.Drawing.Bitmap]$bitmap, [string]$outputPath) {
  $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Convert-GraphicsPathToSvgPath([System.Drawing.Drawing2D.GraphicsPath]$path) {
  $data = $path.PathData
  $points = $data.Points
  $types = $data.Types
  $parts = [System.Collections.Generic.List[string]]::new()
  $i = 0

  while ($i -lt $points.Count) {
    $type = $types[$i] -band 0x07
    $close = ($types[$i] -band 0x80) -ne 0
    $point = $points[$i]

    switch ($type) {
      0 {
        $parts.Add("M$(Format-Number $point.X) $(Format-Number $point.Y)")
        if ($close) { $parts.Add("Z") }
        $i += 1
      }
      1 {
        $parts.Add("L$(Format-Number $point.X) $(Format-Number $point.Y)")
        if ($close) { $parts.Add("Z") }
        $i += 1
      }
      3 {
        if ($i + 2 -ge $points.Count) { throw "Incomplete Bezier segment." }
        $c1 = $points[$i]
        $c2 = $points[$i + 1]
        $end = $points[$i + 2]
        $parts.Add("C$(Format-Number $c1.X) $(Format-Number $c1.Y) $(Format-Number $c2.X) $(Format-Number $c2.Y) $(Format-Number $end.X) $(Format-Number $end.Y)")
        if (($types[$i + 2] -band 0x80) -ne 0) { $parts.Add("Z") }
        $i += 3
      }
      default { throw "Unsupported GraphicsPath point type: $type" }
    }
  }

  return $parts -join " "
}

function Get-SmallTopContours(
  [System.Drawing.Drawing2D.GraphicsPath]$path,
  [System.Drawing.RectangleF]$overallBounds,
  [int]$expectedCount
) {
  $iterator = [System.Drawing.Drawing2D.GraphicsPathIterator]::new($path)
  $subpath = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $candidates = [System.Collections.Generic.List[System.Drawing.RectangleF]]::new()
  $closed = $false

  while ($iterator.NextSubpath($subpath, [ref]$closed) -gt 0) {
    $bounds = $subpath.GetBounds()
    if (
      $closed -and
      $bounds.Width -lt ($fontSize * 0.18) -and
      $bounds.Height -lt ($fontSize * 0.18) -and
      $bounds.Top -lt ($overallBounds.Top + ($fontSize * 0.35))
    ) {
      $candidates.Add($bounds)
    }
    $subpath.Reset()
  }

  $iterator.Dispose()
  $subpath.Dispose()
  $ordered = @($candidates | Sort-Object X)
  if ($ordered.Count -ne $expectedCount) {
    throw "Expected $expectedCount top dot contours, found $($ordered.Count)."
  }
  return $ordered
}

function Get-TextGeometry {
  $privateFonts = [System.Drawing.Text.PrivateFontCollection]::new()
  $privateFonts.AddFontFile($fontPath)
  $family = $privateFonts.Families[0]
  $format = [System.Drawing.StringFormat]::GenericTypographic.Clone()
  $format.FormatFlags = $format.FormatFlags -bor [System.Drawing.StringFormatFlags]::MeasureTrailingSpaces

  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddString(
    $word,
    $family,
    [int][System.Drawing.FontStyle]::Regular,
    [single]$fontSize,
    [System.Drawing.PointF]::new(0, 0),
    $format
  )

  $bounds = $path.GetBounds()
  $nativeDotBounds = Get-SmallTopContours $path $bounds 3
  $translateX = $paddingX - $bounds.X
  $translateY = $paddingTop - $bounds.Y
  $matrix = [System.Drawing.Drawing2D.Matrix]::new()
  $matrix.Translate([single]$translateX, [single]$translateY)
  $path.Transform($matrix)

  $dotCenters = foreach ($dotBounds in $nativeDotBounds) {
    [System.Drawing.PointF]::new(
      [single]($dotBounds.X + ($dotBounds.Width / 2) + $translateX),
      [single]($dotBounds.Y + ($dotBounds.Height / 2) + $translateY)
    )
  }

  $newBounds = $path.GetBounds()
  $width = [Math]::Ceiling($newBounds.Right + $paddingX)
  $height = [Math]::Ceiling($newBounds.Bottom + $paddingBottom)

  $result = [pscustomobject]@{
    Path = $path
    PathData = Convert-GraphicsPathToSvgPath $path
    DotCenters = $dotCenters
    Width = $width
    Height = $height
  }

  $matrix.Dispose()
  $format.Dispose()
  $privateFonts.Dispose()
  return $result
}

function New-WordmarkPng(
  [string]$name,
  [string]$letterColorHex,
  [string]$dotColorHex,
  [string]$backgroundColorHex,
  [int]$canvasWidth,
  [int]$canvasHeight,
  [double]$marginRatio = 0.86
) {
  $scale = [Math]::Min(
    ($canvasWidth * $marginRatio) / $geometry.Width,
    ($canvasHeight * $marginRatio) / $geometry.Height
  )
  $offsetX = ($canvasWidth - ($geometry.Width * $scale)) / 2.0
  $offsetY = ($canvasHeight - ($geometry.Height * $scale)) / 2.0

  $bitmap = [System.Drawing.Bitmap]::new($canvasWidth, $canvasHeight, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $backgroundBrush = [System.Drawing.SolidBrush]::new((ConvertTo-Color $backgroundColorHex))
  $graphics.FillRectangle($backgroundBrush, 0, 0, $canvasWidth, $canvasHeight)

  $graphics.TranslateTransform([single]$offsetX, [single]$offsetY)
  $graphics.ScaleTransform([single]$scale, [single]$scale)

  $letterBrush = [System.Drawing.SolidBrush]::new((ConvertTo-Color $letterColorHex))
  $graphics.FillPath($letterBrush, $geometry.Path)

  $dotBrush = [System.Drawing.SolidBrush]::new((ConvertTo-Color $dotColorHex))
  foreach ($center in $geometry.DotCenters) {
    $graphics.FillEllipse(
      $dotBrush,
      [single]($center.X - $dotRadius),
      [single]($center.Y - $dotRadius),
      [single]($dotRadius * 2),
      [single]($dotRadius * 2)
    )
  }

  Save-Bitmap $bitmap (Join-Path $resolvedOutput $name)

  $dotBrush.Dispose()
  $letterBrush.Dispose()
  $backgroundBrush.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

function New-WordmarkSvg(
  [string]$name,
  [string]$letterColor,
  [string]$dotColor,
  [string]$description
) {
  $circles = ($geometry.DotCenters | ForEach-Object {
    "  <circle cx=`"$(Format-Number $_.X)`" cy=`"$(Format-Number $_.Y)`" r=`"$(Format-Number $dotRadius)`" fill=`"$dotColor`"/>"
  }) -join "`n"

  $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 $($geometry.Width) $($geometry.Height)" role="img" aria-labelledby="title desc">
  <title id="title">intellidip</title>
  <desc id="desc">$description</desc>
  <path fill="$letterColor" fill-rule="evenodd" d="$($geometry.PathData)"/>
$circles
</svg>
"@
  Set-Content -LiteralPath (Join-Path $resolvedOutput $name) -Value $svg -Encoding utf8
}

function Get-CompactMarkGeometry {
  $firstI = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $privateFonts = [System.Drawing.Text.PrivateFontCollection]::new()
  $privateFonts.AddFontFile($fontPath)
  $family = $privateFonts.Families[0]
  $format = [System.Drawing.StringFormat]::GenericTypographic.Clone()
  $firstI.AddString("i", $family, [int][System.Drawing.FontStyle]::Regular, 220.0, [System.Drawing.PointF]::new(0, 0), $format)
  $bounds = $firstI.GetBounds()
  $nativeDotBounds = Get-SmallTopContours $firstI $bounds 1
  $nativeDot = $nativeDotBounds[0]
  $nativeDotCenterX = $nativeDot.X + ($nativeDot.Width / 2)
  $nativeDotCenterY = $nativeDot.Y + ($nativeDot.Height / 2)
  $matrix = [System.Drawing.Drawing2D.Matrix]::new()
  $matrix.Translate([single](128 - $nativeDotCenterX), [single](57 - $nativeDotCenterY))
  $firstI.Transform($matrix)

  $result = [pscustomobject]@{
    Path = $firstI
    PathData = Convert-GraphicsPathToSvgPath $firstI
    DotCenters = @(
      [System.Drawing.PointF]::new(92, 57)
      [System.Drawing.PointF]::new(128, 57)
      [System.Drawing.PointF]::new(164, 57)
    )
    DotRadius = 10.0
    ViewBoxSize = 256
    CornerRadius = 48.0
  }

  $matrix.Dispose()
  $format.Dispose()
  $privateFonts.Dispose()
  return $result
}

function New-CompactMarkSvg([string]$name, [bool]$includeBackground) {
  $background = if ($includeBackground) { "  <rect width=`"256`" height=`"256`" rx=`"48`" fill=`"$($colors.Ink)`"/>`n" } else { "" }
  $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">intellidip compact mark</title>
  <desc id="desc">A serif lowercase i with three amber thinking dots.</desc>
$background  <path fill="$($colors.Ivory)" fill-rule="evenodd" d="$($compactGeometry.PathData)"/>
  <circle cx="92" cy="57" r="10" fill="$($colors.Amber)"/>
  <circle cx="128" cy="57" r="10" fill="$($colors.Amber)"/>
  <circle cx="164" cy="57" r="10" fill="$($colors.Amber)"/>
</svg>
"@
  Set-Content -LiteralPath (Join-Path $resolvedOutput $name) -Value $svg -Encoding utf8
}

function New-AppIconPng([string]$name, [int]$size) {
  $scale = $size / $compactGeometry.ViewBoxSize

  $bitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $graphics.ScaleTransform([single]$scale, [single]$scale)

  $backgroundPath = Get-RoundedRectPath 0 0 $compactGeometry.ViewBoxSize $compactGeometry.ViewBoxSize $compactGeometry.CornerRadius
  $backgroundBrush = [System.Drawing.SolidBrush]::new((ConvertTo-Color $colors.Ink))
  $graphics.FillPath($backgroundBrush, $backgroundPath)

  $letterBrush = [System.Drawing.SolidBrush]::new((ConvertTo-Color $colors.Ivory))
  $graphics.FillPath($letterBrush, $compactGeometry.Path)

  $dotBrush = [System.Drawing.SolidBrush]::new((ConvertTo-Color $colors.Amber))
  foreach ($center in $compactGeometry.DotCenters) {
    $graphics.FillEllipse(
      $dotBrush,
      [single]($center.X - $compactGeometry.DotRadius),
      [single]($center.Y - $compactGeometry.DotRadius),
      [single]($compactGeometry.DotRadius * 2),
      [single]($compactGeometry.DotRadius * 2)
    )
  }

  Save-Bitmap $bitmap (Join-Path $resolvedOutput $name)

  $dotBrush.Dispose()
  $letterBrush.Dispose()
  $backgroundBrush.Dispose()
  $backgroundPath.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

$resolvedOutput = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputDirectory))
New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null
$geometry = Get-TextGeometry
$compactGeometry = Get-CompactMarkGeometry

New-WordmarkSvg "intellidip-wordmark-dark.svg" $colors.Ivory $colors.Amber "Warm ivory outlined wordmark with three amber thinking dots, for dark backgrounds."
New-WordmarkSvg "intellidip-wordmark-light.svg" $colors.Ink $colors.AmberOnLight "Near-black outlined wordmark with three accessible amber thinking dots, for light backgrounds."
New-WordmarkSvg "intellidip-wordmark-mono-light.svg" $colors.Ivory $colors.Ivory "Single-color warm ivory outlined wordmark."
New-WordmarkSvg "intellidip-wordmark-mono-dark.svg" $colors.Ink $colors.Ink "Single-color near-black outlined wordmark."
New-CompactMarkSvg "intellidip-mark.svg" $false
New-CompactMarkSvg "intellidip-app-icon.svg" $true

New-AppIconPng "intellidip-app-icon.png" 512
New-WordmarkPng "intellidip-wordmark-dark.png" $colors.Ivory $colors.Amber $colors.Ink 4096 2304

$geometry.Path.Dispose()
$compactGeometry.Path.Dispose()

$metadata = [ordered]@{
  generatedAt = (Get-Date).ToUniversalTime().ToString("o")
  sourceTypeface = "Baskerville Regular (outlines embedded; runtime font not required)"
  sourceFont = $fontPath
  colors = $colors
  wordmarkViewBox = "0 0 $($geometry.Width) $($geometry.Height)"
  clearSpace = "At least the cap-height of one amber dot on all sides"
  minimumWidth = "120px digital; 32mm print"
}
$metadata | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $resolvedOutput "logo-system.json") -Encoding utf8

Write-Output "Generated intellidip vector logo system at $resolvedOutput"
