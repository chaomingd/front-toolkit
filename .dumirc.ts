import { defineConfig } from 'dumi';
import alias from './alias'

export default defineConfig({
  outputPath: 'docs-dist',
  alias,
  resolve: {
    atomDirs: [
      { type: 'plugin', dir: 'packages/babel-plugin-jsx-style-px-to-rem' }
    ],
  },
  themeConfig: {
    name: 'front-toolkit',
    nav: {
      'en-US': [
        { title: 'JSXStyleToRem', link: '/plugins/README' },
      ],
      'zh-CN': [
        {
          title: 'JSXStyleToRem',
          link: '/plugins/README-cn',
        }
      ],
    }
  },
});
