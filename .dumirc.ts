import { defineConfig } from 'dumi';
import alias from './alias'

export default defineConfig({
  outputPath: 'docs-dist',
  alias,
  resolve: {
    atomDirs: [
      { type: 'jsx-style-px-to-rem-babel-plugin', dir: 'packages/jsx-style-px-to-rem-babel-plugin' }
    ],
  },
  themeConfig: {
    name: 'front-toolkit',
    nav: {
      'en-US': [
        { title: 'JSXStyleToRem', link: '/jsx-style-px-to-tem-babel-plugin/index' },
      ],
      'zh-CN': [
        {
          title: 'JSXStyleToRem',
          link: '/jsx-style-px-to-tem-babel-plugin-cn/index',
        }
      ],
    }
  },
});
