# babel-plugin-jsx-style-px-to-rem Babel 插件

`babel-plugin-jsx-style-px-to-rem` 是一个 Babel 插件，用于将 JSX 和 `React.createElement` 中的 `px` 单位转换为 `rem` 单位。

## 安装

首先，安装插件及其依赖：

```sh
npm install --save-dev babel-plugin-jsx-style-px-to-rem @babel/core @babel/preset-react
```

在 Babel 配置文件中添加插件：

```json
{
  "presets": ["@babel/preset-react"],
  "plugins": [
    "babel-plugin-jsx-style-px-to-rem"
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
      'babel-plugin-style-px-to-tem',
    ],
  });
```

## 配置选项

- `rootValue`: The root element font size, default is `16`.
- `unitPrecision`: The decimal precision for the converted `rem` units, default is `5`.
- `minPixelValue`: The minimum pixel value to convert, default is `1`.
- `shouldTransform`: controls whether px values should be converted to rem.

设置配置选项只能在运行时设置，暂时无法通过 babel 的配置选项设置

```tsx
// 入口文件 index.ts/index.js (app.ts/app.js)
import { setOptionsConfig } from 'babel-plugin-jsx-style-px-to-tem/dist/lib/utils';
setOptionsConfig({
  rootValue: 16,
  unitPrecision: 5,
  minPixelValue: 1,
});
```

## shouldTransform

使用 shouldTransform 函数来控制是否需要转换 rem. 该函数的返回值是布尔值，当返回 true 是表示需要转换，否则无需转换 rem.

```tsx
// babel.config.js
module.exports = {
  presets: ['@babel/preset-react'],
  plugins: ['babel-plugin-jsx-style-px-to-rem'],
};

// 入口文件 index.ts/index.js (app.ts/app.js)
import { setOptionsConfig } from 'babel-plugin-jsx-style-px-to-tem/dist/lib/utils';
setOptionsConfig({
  rootValue: 16,
  unitPrecision: 5,
  minPixelValue: 1,
  shouldTransform: (tagName, props, originalProps) => {
    const className = props?.className || originalProps?.className;
    if (className?.includes('ant-wave')) {
      return false;
    }
    return true;
  }
});
```

举个实际的案例，对于 antd UI 组件库，有些样式是动态计算出来的（`通过js API如element.style.left = element.offsetLeft + 'px'`) 这些样式不应该转换成 rem，这时就可以通过 shouldTransform 函数控制

```tsx
const IGNORE_CLASS_NAMES: Array<
  | string
  | {
      className: string;
      exact?: boolean;
    }
> = [
  {
    className: 'ant-wave',
    exact: true,
  },
  {
    className: 'ant-select-dropdown',
    exact: true,
  },
  {
    className: 'ant-dropdown',
    exact: true,
  },
  {
    className: 'ant-popover',
    exact: true,
  },
  {
    className: 'ant-tooltip',
    exact: true,
  },
  {
    className: 'ant-message',
    exact: true,
  },
  'ant-motion-collapse',
  'ant-zoom',
  'ant-fade',
  'collapse-animation',
];

// 这个函数可以直接导入如 `import { createShouldTransformFunctionWithIgnoreClassNames } from 'babel-plugin-jsx-style-px-to-rem'`
function createShouldTransformFunctionWithIgnoreClassNames(ignoreClassNames) {
  const ignoreClassNamesReg = IGNORE_CLASS_NAMES.map((cls) => {
    if (typeof cls === 'string') {
      return new RegExp(cls);
    }
    if (cls.exact) {
      return new RegExp(`\\b${cls.className}\\b`);
    }
    return new RegExp(cls.className);
  });
  return (_, props, originalProps) => {
    const className = props?.className || originalProps?.className;
    if (className && ignoreClassNamesReg.some((reg) => reg.test(className))) {
      return false;
    }
    return true;
  };
}
module.exports = {
  presets: ['@babel/preset-react'],
  plugins: ['babel-plugin-jsx-style-px-to-rem'],
};


// 入口文件 index.ts/index.js (app.ts/app.js)
import { setOptionsConfig, createShouldTransformFunctionWithIgnoreClassNames } from 'babel-plugin-jsx-style-px-to-tem/dist/lib/utils';
setOptionsConfig({
  rootValue: 16,
  unitPrecision: 5,
  minPixelValue: 1,
  shouldTransform: createShouldTransformFunctionWithIgnoreClassNames(IGNORE_CLASS_NAMES);
});
```
