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
    ["@front-toolkit/jsx-style-px-to-rem-babel-plugin", {
      "rootValue": 16,
      "unitPrecision": 5,
      "minPixelValue": 2
    }]
  ]
}
```

## 配置选项
- `rootValue`: The root element font size, default is `16`.
- `unitPrecision`: The decimal precision for the converted `rem` units, default is `5`.
- `minPixelValue`: The minimum pixel value to convert, default is `1`.