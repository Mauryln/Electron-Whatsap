const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

/**
 * Finds the bundled Node.js executable.
 * @returns {string|null} The path to the Node.js executable or null if not found.
 */
function findNodeExecutable() {
  console.log('? Looking for bundled Node.js executable...');

  // Use app.isPackaged for a reliable check
  if (!app.isPackaged) {
    console.log('? Development environment detected. Using system "node".');
    return 'node';
  }

  console.log('? Packaged environment detected.');
  const resourcesPath = process.resourcesPath;
  const platform = process.platform;
  const nodeExecutableName = platform === 'win32' ? 'node.exe' : 'node';
  const nodePath = path.join(resourcesPath, 'bin', nodeExecutableName);

  console.log(`? Attempting to find Node.js at: ${nodePath}`);

  if (fs.existsSync(nodePath)) {
    console.log(`? Found Node.js at: ${nodePath}`);
    return nodePath;
  }

  console.error(`? CRITICAL: Node.js executable not found at the expected path: ${nodePath}`);
  return null;
}

/**
 * Runs a script using the bundled Node.js executable.
 * @param {string} scriptPath - The path to the script to run.
 * @param {object} options - Spawn options.
 * @returns {import('child_process').ChildProcess}
 */
function runWithNode(scriptPath, options = {}) {
  const nodeExecutable = findNodeExecutable();

  if (!nodeExecutable) {
    // This error will be caught by the main process
    throw new Error(`ENOENT: Could not find the bundled Node.js executable. Looked for it at ${path.join(process.resourcesPath, 'bin')}`);
  }

  console.log(`? Using Node.js from: ${nodeExecutable}`);
  console.log(`? Executing script: ${scriptPath}`);

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Script not found: ${scriptPath}`);
  }

  return spawn(nodeExecutable, [scriptPath], {
    cwd: path.dirname(scriptPath), // Set working directory to the script's location
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: false,
    env: {
      ...process.env,
      ELECTRON_IS_DEV: '0',
      NODE_ENV: 'production'
    },
    ...options
  });
}

module.exports = {
  findNodeExecutable,
  runWithNode
};