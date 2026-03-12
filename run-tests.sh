#!/bin/bash

# Bash script to run tests with code coverage
echo "Smart Appointment Booking System - Test Runner"
echo "============================================="

# Navigate to the test project directory
cd SmartBookingAPI.Tests

echo ""
echo "Restoring NuGet packages..."
dotnet restore

echo ""
echo "Building test project..."
dotnet build --no-restore

echo ""
echo "Running unit tests with code coverage..."
dotnet test --no-build --verbosity normal --collect:"XPlat Code Coverage" --results-directory:"./TestResults"

echo ""
echo "Generating HTML coverage report..."
# Install reportgenerator tool if not already installed
dotnet tool install -g dotnet-reportgenerator-globaltool 2>/dev/null

# Find the latest coverage file
COVERAGE_FILE=$(find ./TestResults -name "coverage.cobertura.xml" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)

if [ -n "$COVERAGE_FILE" ]; then
    echo "Coverage file found: $COVERAGE_FILE"
    
    # Generate HTML report
    reportgenerator -reports:"$COVERAGE_FILE" -targetdir:"./CoverageReport" -reporttypes:"Html;TextSummary"
    
    echo ""
    echo "Code coverage report generated in: ./CoverageReport"
    echo "Open ./CoverageReport/index.html to view the detailed report"
    
    # Display summary
    if [ -f "./CoverageReport/Summary.txt" ]; then
        echo ""
        echo "Coverage Summary:"
        cat "./CoverageReport/Summary.txt"
    fi
else
    echo "No coverage file found!"
fi

echo ""
echo "Test execution completed!"

# Return to original directory
cd ..