@echo off
echo ========================================
echo Instalacion de WhatsApp Bimcat Electron
echo ========================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado.
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js encontrado.
echo.

echo Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Error al instalar dependencias.
    pause
    exit /b 1
)

echo.
echo Dependencias instaladas correctamente.
echo.

echo Creando carpetas necesarias...
if not exist "uploads" mkdir uploads
if not exist "dist" mkdir dist

echo.
echo ========================================
echo Instalacion completada exitosamente!
echo ========================================
echo.
echo Para ejecutar la aplicacion:
echo   npm run dev
echo.
echo Para construir la aplicacion:
echo   npm run build:win
echo.
pause
