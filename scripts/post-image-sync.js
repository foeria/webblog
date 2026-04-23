'use strict';

const fs = require('fs/promises');
const path = require('path');

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyDirectory(sourceDir, targetDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  await fs.mkdir(targetDir, { recursive: true });

  await Promise.all(entries.map(async entry => {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
      return;
    }

    if (entry.isFile()) {
      await fs.copyFile(sourcePath, targetPath);
    }
  }));
}

hexo.extend.filter.register('after_generate', async function() {
  const sourceImageRoot = path.join(hexo.source_dir, '_posts', 'image');
  const publicImageRoot = path.join(hexo.public_dir, 'image');

  if (!(await pathExists(sourceImageRoot))) {
    return;
  }

  await fs.rm(publicImageRoot, { recursive: true, force: true });
  await copyDirectory(sourceImageRoot, publicImageRoot);
});