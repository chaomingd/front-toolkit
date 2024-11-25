# jsx-style-px-to-rem Babel Plugin

`jsx-style-px-to-rem` is a Babel plugin that converts `px` units to `rem` units in JSX and `React.createElement`.

## Installation

First, install the plugin and its dependencies:

```sh
npm install --save-dev @front-toolkit/jsx-style-px-to-rem-babel-plugin @babel/core @babel/preset-react
```

Add the plugin to your Babel configuration file:

```json
{
  "presets": ["@babel/preset-react"],
  "plugins": [
    ["@front-toolkit/jsx-style-px-to-rem-babel-plugin", {
      "rootValue": 16,
      "unitPrecision": 5,
      "minPixelValue": 2
    }]
  ]
}
```

## Configuration Options

- `rootValue`: The root element font size, default is `16`.
- `unitPrecision`: The decimal precision for the converted `rem` units, default is `5`.
- `minPixelValue`: The minimum pixel value to convert, default is `1`.

## License

MIT
