import { readdirSync } from 'fs';
import { join } from 'path';

const pkgList = readdirSync(join(__dirname, 'packages')).map((pkg) => {
  const packageJson = require(join(__dirname, 'packages', pkg, 'package.json'));
  return {
    name: packageJson.name,
    exports: packageJson.exports,
    path: join(__dirname, 'packages', pkg, 'src'),
  };
});

const alias = pkgList.reduce((pre, pkg) => {
  pre[pkg.name] = pkg.path;
  return pre;
}, {} as Record<string, string>);

export default alias;