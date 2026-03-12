# PowerShell script to run tests with code coverage
Write-Host "Smart Appointment Booking System - Test Runner" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Navigate to the test project directory
Set-Location "SmartBookingAPI.Tests"

Write-Host "`nRestoring NuGet packages..." -ForegroundColor Yellow
dotnet restore

Write-Host "`nBuilding test project..." -ForegroundColor Yellow
dotnet build --no-restore

Write-Host "`nRunning unit tests with code coverage..." -ForegroundColor Yellow
dotnet test --no-build --verbosity normal --collect:"XPlat Code Coverage" --results-directory:"./TestResults"

Write-Host "`nGenerating HTML coverage report..." -ForegroundColor Yellow
# Install reportgenerator tool if not already installed
dotnet tool install -g dotnet-reportgenerator-globaltool 2>$null

# Find the latest coverage file
$coverageFile = Get-ChildItem -Path "./TestResults" -Recurse -Filter "coverage.cobertura.xml" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($coverageFile) {
    Write-Host "Coverage file found: $($coverageFile.FullName)" -ForegroundColor Green
    
    # Generate HTML report
    reportgenerator -reports:"$($coverageFile.FullName)" -targetdir:"./CoverageReport" -reporttypes:"Html;TextSummary"
    
    Write-Host "`nCode coverage report generated in: ./CoverageReport" -ForegroundColor Green
    Write-Host "Open ./CoverageReport/index.html to view the detailed report" -ForegroundColor Green
    
    # Display summary
    if (Test-Path "./CoverageReport/Summary.txt") {
        Write-Host "`nCoverage Summary:" -ForegroundColor Cyan
        Get-Content "./CoverageReport/Summary.txt"
    }
} else {
    Write-Host "No coverage file found!" -ForegroundColor Red
}

Write-Host "`nTest execution completed!" -ForegroundColor Green

# Return to original directory
Set-Location ".."