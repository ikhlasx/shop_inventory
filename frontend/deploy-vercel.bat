@echo off
echo 🚀 Starting Vercel deployment process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the frontend directory
    pause
    exit /b 1
)

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Warning: No .env file found
    echo 📝 Please create a .env file with your environment variables:
    echo    REACT_APP_BACKEND_URL=https://your-backend-domain.com
    echo    DISABLE_HOT_RELOAD=true
    echo.
    set /p "continue=Do you want to continue anyway? (y/n): "
    if /i not "%continue%"=="y" (
        pause
        exit /b 1
    )
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build the project
echo 🔨 Building project...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please fix the errors and try again.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo 🎉 Deployment complete!
echo 📱 Your app should now be live on Vercel!
echo 🔧 Don't forget to set your environment variables in the Vercel dashboard:
echo    - REACT_APP_BACKEND_URL
echo    - DISABLE_HOT_RELOAD

pause 