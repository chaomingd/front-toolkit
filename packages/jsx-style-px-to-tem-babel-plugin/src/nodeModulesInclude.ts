import fs from 'fs';
import path from 'path';

export function nodeModulesInclude(filename: string) {
  const nodeModulesIndex = filename.lastIndexOf('node_modules');
  if (nodeModulesIndex === -1) {
    return false;
  }
  const splitIndex = nodeModulesIndex + 'node_modules'.length + 1;
  const nodeModulesPackagePath = filename.slice(splitIndex);
  const nodeModulesPackagePathArr = nodeModulesPackagePath.split(path.sep);
  let nodeModulesPackage = nodeModulesPackagePathArr[0];
  if (nodeModulesPackage[0] === '@') {
    nodeModulesPackage += path.sep + nodeModulesPackagePathArr[1];
  }
  const nodeModulesPackageJsonPath = path.join(
    filename.slice(0, splitIndex),
    nodeModulesPackage,
    'package.json',
  );
  if (fs.existsSync(nodeModulesPackageJsonPath)) {
    try {
      const packageJson = require(nodeModulesPackageJsonPath);
      if (
        'react' in (packageJson.dependencies || {}) ||
        'react' in (packageJson.peerDependencies || {})
      ) {
        return true;
      }
    } catch (error) {
      return false;
    }
  }
  return false;
}
