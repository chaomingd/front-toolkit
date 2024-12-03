import fs from 'fs';
import path from 'path';

const packageCache = new Map<string, boolean>();

export function nodeModulesInclude(filename: string) {
  const nodeModulesIndex = filename.lastIndexOf('node_modules');
  if (nodeModulesIndex === -1) {
    return false;
  }
  const splitIndex = nodeModulesIndex + 'node_modules'.length + 1;
  const nodeModulesPackagePath = filename.slice(splitIndex);
  const nodeModulesPackagePathArr = nodeModulesPackagePath.split(path.sep);
  let nodeModulesPackageName = nodeModulesPackagePathArr[0];
  if (nodeModulesPackageName[0] === '@') {
    nodeModulesPackageName += path.sep + nodeModulesPackagePathArr[1];
  }
  let shouldCompile = packageCache.get(nodeModulesPackageName);
  if (shouldCompile !== undefined) {
    return shouldCompile;
  }
  const nodeModulesPackageJsonPath = path.join(
    filename.slice(0, splitIndex),
    nodeModulesPackageName,
    'package.json',
  );
  if (fs.existsSync(nodeModulesPackageJsonPath)) {
    try {
      const packageJson = require(nodeModulesPackageJsonPath);
      if (
        'react' in (packageJson.dependencies || {}) ||
        'react' in (packageJson.peerDependencies || {})
      ) {
        shouldCompile = true;
      }
    } catch (error) {
      shouldCompile = false;
    }
  } else {
    shouldCompile = false;
  }
  packageCache.set(nodeModulesPackageName, shouldCompile || false);
  return shouldCompile;
}
