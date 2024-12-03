# babel-plugin-jsx-style-px-to-rem Babel Plugin

[中文文档](https://github.com/chaomingd/front-toolkit/blob/main/packages/babel-plugin-jsx-style-px-to-tem/README.zh-CN.md)

`jsx-style-px-to-rem` is a Babel plugin that converts `px` units to `rem` units in JSX and `React.createElement`.

## Installation

First, install the plugin and its dependencies:

```sh
npm install --save-dev babel-plugin-jsx-style-px-to-rem @babel/core @babel/preset-react
```

Add the plugin to your Babel configuration file:

```json
{
  "presets": ["@babel/preset-react"],
  "plugins": [
    ["babel-plugin-jsx-style-px-to-rem", {
      "rootValue": 16,
      "unitPrecision": 5,
      "minPixelValue": 2
    }]
  ]
}
```

## Note
To convert third-party React component libraries in `node_modules`, you can use the `nodeModulesInclude` helper function (used with webpack) to include React component libraries. `The `nodeModulesInclude` function works by reading the third-party `package.json` and filtering in libraries that have `react` in their `dependencies` or `peerDependencies`.`

```tsx
// webpack.config.js
import { nodeModulesInclude } from 'babel-plugin-jsx-style-px-to-rem';
module.exports = {
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        include: [nodeModulesInclude],
        loader: 'babel-plugin-jsx-style-px-to-rem',
        options: {
          rootValue: 16,
          unitPrecision: 5,
          minPixelValue: 2,
        },
      },
    ],
  },
};

// for webpack chain api
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

## Configuration Options

- `rootValue`: The root element font size, default is `16`.
- `unitPrecision`: The decimal precision for the converted `rem` units, default is `5`.
- `minPixelValue`: The minimum pixel value to convert, default is `1`.

## License

MIT
