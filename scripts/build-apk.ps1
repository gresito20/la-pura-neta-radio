$jdkPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
if (-not (Test-Path $jdkPath)) {
    $found = Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Filter "jdk-17*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $jdkPath = $found.FullName }
}

$env:JAVA_HOME = $jdkPath
$env:ANDROID_HOME = "C:\Users\GregKO\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

Write-Host "🚀 Compilando APK con Java JDK 17 ($env:JAVA_HOME)..."
Set-Location -Path "$PSScriptRoot\..\android"

if (Test-Path ".\gradlew.bat") {
    .\gradlew.bat assembleDebug
} else {
    Write-Error "No se encontró gradlew.bat en la carpeta android"
}
