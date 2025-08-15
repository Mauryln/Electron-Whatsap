const path = require('path');
const fs = require('fs');

module.exports = {
  appId: "com.bimcat.whatsapp",
  productName: "WhatsApp Bimcat",
  directories: {
    output: "dist"
  },
  asar: true, // ✅ Fuerza a crear app.asar
  asarUnpack: [
    "**/node_modules/puppeteer/**",
    // Solo dejar fuera módulos nativos pesados si existen
    "node_modules/{sharp,sqlite3}/**"
  ],
  files: [
    "main.js",
    "preload.js",
    "server-starter.js",
    "node-finder.js",
    "server-inline.js",
    "renderer/**/*",
    "server/**/*",
    "assets/**/*"
    // node_modules se incluye automáticamente
  ],
  extraResources: [
    {
      from: "assets",
      to: "assets"
    }
  ],
  win: {
    target: "nsis",
    icon: "assets/icon.ico",
    artifactName: "${productName}-${version}-${arch}.${ext}",
    publisherName: "Bimcat Team"
  },
  mac: {
    target: "dmg",
    icon: "assets/icon.icns",
    category: "public.app-category.productivity"
  },
  linux: {
    target: "AppImage",
    icon: "assets/icon.png",
    category: "Utility"
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "WhatsApp Bimcat"
  },
  afterPack: async (context) => {
    console.log('📦 Empaquetado completado');
    console.log('📁 Archivos empaquetados en:', context.appOutDir);

    const asarPath = path.join(context.appOutDir, 'resources', 'app.asar');
    if (fs.existsSync(asarPath)) {
      const stats = fs.statSync(asarPath);
      console.log(`✅ app.asar creado: ${(stats.size / 1024 / 1024).toFixed(1)}MB`);
    } else {
      console.warn('⚠️  app.asar no encontrado');
    }

    const resourcesPath = path.join(context.appOutDir, 'resources');
    if (fs.existsSync(resourcesPath)) {
      const files = fs.readdirSync(resourcesPath);
      console.log(`✅ resources: ${files.length} archivos/directorios`);
    }

    // --- COPIAR NODE.EXE MANUALMENTE ---
    const sourceNodePath = path.join(process.cwd(), 'bin', process.platform === 'win32' ? 'node.exe' : 'node');
    const destNodeDir = path.join(context.appOutDir, 'resources', 'bin');
    const destNodePath = path.join(destNodeDir, process.platform === 'win32' ? 'node.exe' : 'node');

    if (fs.existsSync(sourceNodePath)) {
      if (!fs.existsSync(destNodeDir)) {
        fs.mkdirSync(destNodeDir, { recursive: true });
      }
      fs.copyFileSync(sourceNodePath, destNodePath);
      console.log(`✅ node.exe copiado a: ${destNodePath}`);
    } else {
      console.warn(`⚠️  node.exe no encontrado en: ${sourceNodePath}. No se pudo copiar.`);
    }
  }
};
