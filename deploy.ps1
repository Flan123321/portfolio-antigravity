# Vercel Deployment Script for Portfolio
# This script automates the deployment process

Write-Host "🚀 Portfolio Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking for Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Vercel CLI globally..." -ForegroundColor Yellow
    npm install -g vercel
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        Write-Host "Please install manually: npm install -g vercel" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ Vercel CLI installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
}

Write-Host ""

# Test build
Write-Host "Testing production build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host "Please fix build errors before deploying" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Prompt for deployment type
Write-Host "Select deployment type:" -ForegroundColor Cyan
Write-Host "1. Preview deployment (test before production)" -ForegroundColor White
Write-Host "2. Production deployment" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1 or 2)"

Write-Host ""

if ($choice -eq "1") {
    Write-Host "🚀 Deploying preview..." -ForegroundColor Cyan
    vercel
} elseif ($choice -eq "2") {
    Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
    vercel --prod
} else {
    Write-Host "❌ Invalid choice" -ForegroundColor Red
    exit 1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🎉 Your portfolio is now live!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
}
