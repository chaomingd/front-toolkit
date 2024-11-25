const fs = require('fs/promises');
const path = require('path');

const packageName = process.argv[2];

async function createTemple() {
  await fs.cp(path.resolve(__dirname, '../packageTemplate'), path.resolve(__dirname, `../packages/${packageName}`), { recursive: true });
  // Update tsconfig.json
  const tsConfigPath = path.resolve(__dirname, `../packages/${packageName}/tsconfig.json`);
  const tsConfigContent = await fs.readFile(tsConfigPath, 'utf-8');
  const tsConfig = JSON.parse(tsConfigContent);
  tsConfig.extends = '../../tsconfig.json';
  await fs.writeFile(tsConfigPath, JSON.stringify(tsConfig, null, 2));
  // Update package.json
  const packageJsonPath = path.resolve(__dirname, `../packages/${packageName}/package.json`);
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent);
  packageJson.name = `@front-toolkit/${packageName}`;
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  // update root tsconfig.json
  const rootTsConfigPath = path.resolve(__dirname, '../tsconfig.json');
  const rootTsConfigContent = await fs.readFile(rootTsConfigPath, 'utf-8');
  const rootTsConfig = JSON.parse(rootTsConfigContent);
  rootTsConfig.compilerOptions.paths[`@front-toolkit/${packageName}`] = [`./packages/${packageName}/src/`];
  await fs.writeFile(rootTsConfigPath, JSON.stringify(rootTsConfig, null, 2));
}

createTemple().catch(console.error);