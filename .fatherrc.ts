import { defineConfig } from 'father';

export default defineConfig({
  // more father config: https://github.com/umijs/father/blob/master/docs/config.md
  umd: undefined,
  cjs: {
    output: 'dist/lib',
    transformer: 'babel',
  },
  esm: {
    output: 'dist/esm',
    transformer: 'babel',
  },
});
