Write-Host "Installing dependencies for Noah V4..." -ForegroundColor Green
Write-Host ""

Write-Host "Installing npm packages..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run compile" -ForegroundColor White
Write-Host "2. Run: npm test" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"

