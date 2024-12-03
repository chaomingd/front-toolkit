# jsx-style-px-to-rem Babel 插件

`jsx-style-px-to-rem` 是一个 Babel 插件，用于将 JSX 和 `React.createElement` 中的 `px` 单位转换为 `rem` 单位。

## 安装

首先，安装插件及其依赖：

```sh
npm install --save-dev @front-toolkit/jsx-style-px-to-rem-babel-plugin @babel/core @babel/preset-react
```

在 Babel 配置文件中添加插件：

```json
{
  "presets": ["@babel/preset-react"],
  "plugins": [
    [
      "@front-toolkit/jsx-style-px-to-rem-babel-plugin",
      {
        "rootValue": 16,
        "unitPrecision": 5,
        "minPixelValue": 2
      }
    ]
  ]
}
```

## 注意

如何要转换 node_module 中的第三方 react 组件库，可以使用 nodeModulesInclude (配合 webpack 使用) 辅助函数来包含 react 组件库
`nodeModulesInclude 的原理是读取第三方的package.json，过滤出packageJson.dependendies 或者 packageJson.peerDependencies 中包含 react 的组件库`

```tsx
// webpack.config.js
import { nodeModulesInclude } from 'babel-plugin-style-px-to-tem';
module.exports = {
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        include: [nodeModulesInclude],
        loader: 'babel-plugin-style-px-to-tem',
        options: {
          rootValue: 16,
          unitPrecision: 5,
          minPixelValue: 2,
        },
      },
    ],
  },
};

// 对于 webpack chain api
config.module
  .rule('jsx-style-px-to-tem')
  .test(/\.m?jsx?$/)
  .include.add(nodeModulesInclude)
  .end()
  .use('babel-loader')
  .loader('babel-loader')
  .options({
    plugins: [
      [
        'babel-plugin-style-px-to-tem',
        {
          rootValue: 16,
          unitPrecision: 3,
          minPixelValue: 1,
        },
      ],
    ],
  });
```

## 配置选项

- `rootValue`: The root element font size, default is `16`.
- `unitPrecision`: The decimal precision for the converted `rem` units, default is `5`.
- `minPixelValue`: The minimum pixel value to convert, default is `1`.
