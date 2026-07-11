$ErrorActionPreference = 'Stop'

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][scriptblock]$Action
    )

    & $Action
    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed with exit code $LASTEXITCODE"
    }
}

$project = $PSScriptRoot
$root = Split-Path $project -Parent
$tools = Join-Path $root 'android-build-tools'
$app = Join-Path $project 'app\src\main'
$jdk = (Get-ChildItem -LiteralPath (Join-Path $tools 'jdk') -Directory | Select-Object -First 1).FullName
$sdk = Join-Path $tools 'android-sdk'
$buildTools = Join-Path $sdk 'build-tools\34.0.0'
$androidJar = Join-Path $sdk 'platforms\android-34\android.jar'

if (-not (Test-Path -LiteralPath $androidJar)) {
    throw "Missing Android SDK platform: $androidJar"
}

$env:JAVA_HOME = $jdk
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$env:Path = (Join-Path $jdk 'bin') + ';' + $buildTools + ';' + $env:Path

$build = Join-Path $project 'manual-build'
if (Test-Path -LiteralPath $build) {
    $resolvedBuild = (Resolve-Path -LiteralPath $build).Path
    if (-not $resolvedBuild.StartsWith($project, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to delete outside project: $resolvedBuild"
    }
    Remove-Item -LiteralPath $resolvedBuild -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $build | Out-Null

$manifest = Join-Path $build 'AndroidManifest.xml'
$manifestText = Get-Content -LiteralPath (Join-Path $app 'AndroidManifest.xml') -Raw
if ($manifestText -notmatch '\spackage=') {
    $manifestText = $manifestText -replace '(<manifest\s+xmlns:android="http://schemas.android.com/apk/res/android")', '$1 package="com.starorchard.platform"'
}
Set-Content -LiteralPath $manifest -Value $manifestText -Encoding UTF8

$compiledResources = Join-Path $build 'compiled-res.zip'
Invoke-Step 'aapt2 compile' {
    & (Join-Path $buildTools 'aapt2.exe') compile --dir (Join-Path $app 'res') -o $compiledResources
}

$generated = Join-Path $build 'generated'
New-Item -ItemType Directory -Force -Path $generated | Out-Null
$unsigned = Join-Path $build 'unsigned-unaligned.apk'
Invoke-Step 'aapt2 link' {
    & (Join-Path $buildTools 'aapt2.exe') link `
        -o $unsigned `
        -I $androidJar `
        --manifest $manifest `
        --java $generated `
        --custom-package com.starorchard.platform `
        --min-sdk-version 23 `
        --target-sdk-version 34 `
        $compiledResources
}

$classes = Join-Path $build 'classes'
New-Item -ItemType Directory -Force -Path $classes | Out-Null
$javaFiles = @((Join-Path $app 'java\com\starorchard\platform\MainActivity.java')) + @(Get-ChildItem -LiteralPath $generated -Recurse -Filter *.java | ForEach-Object { $_.FullName })
Invoke-Step 'javac' {
    & (Join-Path $jdk 'bin\javac.exe') -encoding UTF-8 -source 8 -target 8 -classpath $androidJar -d $classes $javaFiles
}

$dex = Join-Path $build 'dex'
New-Item -ItemType Directory -Force -Path $dex | Out-Null
$classFiles = Get-ChildItem -LiteralPath $classes -Recurse -Filter *.class | ForEach-Object { $_.FullName }
Invoke-Step 'd8' {
    & (Join-Path $buildTools 'd8.bat') --lib $androidJar --output $dex $classFiles
}

Invoke-Step 'jar add dex' {
    & (Join-Path $jdk 'bin\jar.exe') uf $unsigned -C $dex classes.dex
}

$assetStage = Join-Path $build 'asset-stage'
$assetSource = Join-Path $app 'assets'
New-Item -ItemType Directory -Force -Path $assetStage | Out-Null
Copy-Item -LiteralPath $assetSource -Destination $assetStage -Recurse -Force

Invoke-Step 'jar add assets' {
    & (Join-Path $jdk 'bin\jar.exe') uf $unsigned -C $assetStage assets
}

$aligned = Join-Path $build 'star-orchard-unsigned-aligned.apk'
Invoke-Step 'zipalign' {
    & (Join-Path $buildTools 'zipalign.exe') -f 4 $unsigned $aligned
}

$keyStore = Join-Path $project 'debug.keystore'
if (-not (Test-Path -LiteralPath $keyStore)) {
    Invoke-Step 'keytool' {
        & (Join-Path $jdk 'bin\keytool.exe') -genkeypair -keystore $keyStore -storepass android -keypass android -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=Android Debug,O=Android,C=US'
    }
}

$output = Join-Path $project 'star-orchard-debug.apk'
Invoke-Step 'apksigner sign' {
    & (Join-Path $buildTools 'apksigner.bat') sign --ks $keyStore --ks-pass pass:android --key-pass pass:android --out $output $aligned
}

$idsig = "$output.idsig"
if (Test-Path -LiteralPath $idsig) {
    Remove-Item -LiteralPath $idsig -Force
}

Invoke-Step 'apksigner verify' {
    & (Join-Path $buildTools 'apksigner.bat') verify --verbose $output
}

Get-Item -LiteralPath $output | Select-Object FullName, Length
