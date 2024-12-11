import { defineConfig } from 'father';

export default defineConfig({
  extends: '../../.fatherrc.ts',
  umd: undefined,
  esm: undefined,
  cjs: {
    output: 'dist/lib',
    transformer: 'babel',
  },
});
