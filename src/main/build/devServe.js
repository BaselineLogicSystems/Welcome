#!/usr/bin/env node
/**
 * devServe.js – starts python –m http.server with the port from the
 *   environment variable `PORT`.  Works on Windows, macOS, Linux.
 */

const { spawn } = require('child_process');
const path = require('path');

/* Todo: accept port command-line argument from any OS;
   Argument /may/ override environment variable (???) */

const port = process.env.PORT || 8017;

// Resolve the path to the directory that should be served.
const publicDir = path.resolve(process.cwd(), 'public');

// Spawn the python process.
const py = spawn(
  process.platform === 'win32' ? 'python' : 'python3',
  ['-m', 'http.server', port, '--directory', publicDir],
  { stdio: 'inherit' }
);

// Exit the node process when the python process exits.
py.on('exit', (code) => {
  process.exit(code);
});
