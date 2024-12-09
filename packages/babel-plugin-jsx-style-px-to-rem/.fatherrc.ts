import { defineConfig } from 'father';

export default defineConfig({
  extends: '../../.fatherrc.ts',
  umd: {
    output: 'dist/umd',
    name: 'BabelPluginJsxStylePxToRem'
  },
  cjs: {
    output: 'dist/lib',
    transformer: 'babel',
  },
  esm: undefined,
});
