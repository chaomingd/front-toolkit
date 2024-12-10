# babel-plugin-jsx-style-px-to-rem Babel Plugin

[中文文档](https://github.com/chaomingd/front-toolkit/blob/main/packages/babel-plugin-jsx-style-px-to-rem/README.zh-CN.md)

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
    "babel-plugin-jsx-style-px-to-rem"
  ]
}
```

## Note

To convert third-party React component libraries in `node_modules`, you can use the `nodeModulesInclude` helper function (used with webpack) to include React component libraries. `The `nodeModulesInclude`function works by reading the third-party`package.json`and filtering in libraries that have`react`in their`dependencies`or`peerDependencies`.`

```tsx
// webpack.config.js
import { nodeModulesInclude } from 'babel-plugin-jsx-style-px-to-rem';
module.exports = {
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        include: [nodeModulesInclude],
        loader: 'babel-plugin-jsx-style-px-to-rem'
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
      'babel-plugin-style-px-to-tem'
    ],
  });
```

## Configuration Options

```tsx
export interface inlineCssPxToRemOptions {
  rootValue?: number;
  unitPrecision?: number;
  minPixelValue?: number;
  shouldTransform?: (
    tagName: string,
    props: Record<string, any> | undefined | null, // props needs to covert
    originalProps: Record<string, any> | undefined | null,
    isSvgChildElementTag: boolean
  ) => boolean;
}
```
- `rootValue`: The root element font size, default is `16`.
- `unitPrecision`: The decimal precision for the converted `rem` units, default is `5`.
- `minPixelValue`: The minimum pixel value to convert, default is `1`.
- `shouldTransform`: controls whether px values should be converted to rem.

Configuration options can only be set at runtime and cannot be set through Babel's configuration options for now.

```tsx
// entry file eg: index.ts/index.js (app.ts/app.js)
import { setOptionsConfig } from 'babel-plugin-jsx-style-px-to-tem/dist/lib/utils';
setOptionsConfig({
  rootValue: 16,
  unitPrecision: 5,
  minPixelValue: 1,
});
```

## shouldTransform

Use the `shouldTransform` function to control whether `px` values should be converted to `rem`. The function returns a boolean value, where returning `true` indicates that the conversion should occur, and returning `false` indicates that the conversion should not occur.

```tsx
// babel.config.js
module.exports = {
  presets: ['@babel/preset-react'],
  plugins: ['babel-plugin-jsx-style-px-to-rem'],
};

// entry file eg: index.ts/index.js (app.ts/app.js)
import { setOptionsConfig } from 'babel-plugin-jsx-style-px-to-tem/dist/lib/utils';
setOptionsConfig({
  rootValue: 16,
  unitPrecision: 5,
  minPixelValue: 1,
  shouldTransform: (tagName, props, originalProps, isSvgChildElementTag) => {
    if (isSvgChildElementTag) { // svg child element should not be tranform
      return false;
    }
    const className = props?.className || originalProps?.className;
    if (className?.includes('ant-wave')) {
      return false;
    }
    return true;
  }
});
```

For example, in the case of the antd UI component library, some styles are dynamically calculated (e.g., `through js API like element.style.left = element.offsetLeft + 'px'`). These styles should not be converted to `rem`. In such cases, you can control this using the `shouldTransform` function.
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

/**
 * 
 * This function can be directly imported as `import createShouldTransformFunctionWithIgnoreClassNames } from 'babel-plugin-jsx-style-px-to-rem'
*/
function createShouldTransformFunctionWithIgnoreClassNames(ignoreClassNames: Array<
  | string
  | {
      className: string;
      exact?: boolean;
    }
>) {
  const ignoreClassNamesReg = ignoreClassNames.map((cls) => {
    if (typeof cls === 'string') {
      return new RegExp(cls);
    }
    if (cls.exact) {
      return new RegExp(`\\b${cls.className}\\b`);
    }
    return new RegExp(cls.className);
  });
  return (_, props, originalProps, isSvgChildElementTag) => {
    if (isSvgChildElementTag) { // svg child element should not be tranform
      return false;
    }
    const className = props?.className || originalProps?.className;
    if (
      className &&
      ignoreClassNamesReg.some((reg) => reg.test(className))
    ) {
      return false;
    }
    return true;
  };
}
module.exports = {
  presets: ['@babel/preset-react'],
  plugins: [
    'babel-plugin-jsx-style-px-to-rem',
  ],
};

// entry file index.ts/index.js (app.ts/app.js)
import { setOptionsConfig, createShouldTransformFunctionWithIgnoreClassNames } from 'babel-plugin-jsx-style-px-to-tem/dist/lib/utils';
setOptionsConfig({
  rootValue: 16,
  unitPrecision: 5,
  minPixelValue: 1,
  shouldTransform: createShouldTransformFunctionWithIgnoreClassNames(IGNORE_CLASS_NAMES);
});
```

## License

MIT
