import { NodePath, types as babelTypes, template } from "@babel/core";
import {
  inlineCssPxToRemOptions,
  covertStylePropertyToRem,
  isStyleAttibute,
  setOptionsConfig,
  isIgnoreUnitProperty,
  isNeedTranform,
} from "./utils";
import pathLib from "path";
import fs from "fs";

const CONFIG_FILE_PATH = pathLib.resolve(__dirname, "./config.js");
const LIB_NAME = "@front-toolkit/jsx-style-px-to-rem-babel-plugin/utils";
const PX_TO_REM = "covertStylePropertyToRem";
const PX_TO_REM_ALIAS = "__jsx_inline_covertStylePropertyToRem";
const COVERT_JSX_STYLE_TO_REM = "covertJsxStyleToRem";
const COVERT_JSX_STYLE_TO_REM_ALIAS = "__jsx_inline_covertJsxStyleToRem";
const COVERT_JSX_PROPS_TO_REM = "covertJsxPropsToRem";
const COVERT_JSX_PROPS_TO_REM_ALIAS = "__jsx_inline_covertJsxPropsToRem";

function covertObjectExpressionToRem(path: NodePath) {
  if (!path.isObjectExpression()) {
    wrapperCallObjectExpressionToRem(path as NodePath<babelTypes.Expression>);
    return;
  }
  const properties = path.get(
    "properties"
  ) as NodePath<babelTypes.ObjectProperty>[];
  if (!properties || !properties.length) return;
  properties.forEach((property) => {
    const key = property.get("key") as NodePath<babelTypes.Identifier>;
    if (!key.node) return;
    const value = property.get("value") as NodePath<any>;
    const keyName = key.node.name;
    if (isIgnoreUnitProperty(keyName)) {
      return;
    }

    if (value.isStringLiteral() || value.isNumericLiteral()) {
      const remValue = covertStylePropertyToRem(value.node.value, keyName);
      value.replaceWith(
        typeof remValue === "string"
          ? babelTypes.stringLiteral(remValue)
          : babelTypes.numericLiteral(remValue)
      );
      return;
    }
    wrapperCallExpressionToRem(value, babelTypes.stringLiteral(keyName));
  });
}

function wrapperCallObjectExpressionToRem(
  path: NodePath<babelTypes.Expression>
) {
  path.replaceWith(
    babelTypes.callExpression(
      babelTypes.identifier(COVERT_JSX_STYLE_TO_REM_ALIAS),
      [path.node]
    )
  );
}

function wrapperCallPropsToRem(path: NodePath<babelTypes.Expression>) {
  path.replaceWith(
    babelTypes.callExpression(
      babelTypes.identifier(COVERT_JSX_PROPS_TO_REM_ALIAS),
      [path.node]
    )
  );
}

function wrapperCallExpressionToRem(
  path: NodePath<babelTypes.Expression>,
  keyNode: babelTypes.Expression
) {
  path.replaceWith(
    babelTypes.callExpression(babelTypes.identifier(PX_TO_REM_ALIAS), [
      path.node,
      keyNode,
    ])
  );
}

export default function (_: any, options: inlineCssPxToRemOptions) {
  if (options) {
    try {
      const optionsString = JSON.stringify(options);
      const configFileContent = fs.readFileSync(CONFIG_FILE_PATH).toString();
      fs.writeFileSync(
        CONFIG_FILE_PATH,
        configFileContent.replace(
          /(CONFIG_OPTIONS = )([\s\S]+)/,
          `$1${optionsString};\n`
        )
      );
    } catch (e) {}
  }
  setOptionsConfig(options);

  return {
    visitor: {
      Program(path: NodePath<babelTypes.Program>) {
        let shouldImportHelpFunction = false;
        path.traverse({
          JSXAttribute: {
            exit(path: NodePath<babelTypes.JSXAttribute>) {
              const atributName = path.node.name.name as string;
              const tagName = (path.parentPath.node as any).name.name;
              if (!isNeedTranform(tagName) || !isStyleAttibute(atributName)) {
                return;
              }
              const expression = path.get("value").get("expression");
              if (expression) {
                // 添加一个标志来跟踪是否已经处理过该节点
                if ((path.node as any).__processed_jsx_px_to_rem) {
                  return;
                }
                (path.node as any).__processed_jsx_px_to_rem = true;
                shouldImportHelpFunction = true;
                covertObjectExpressionToRem(
                  expression as NodePath<babelTypes.ObjectProperty>
                );
              }
            },
          },
          JSXSpreadAttribute: {
            exit(path: NodePath<babelTypes.JSXSpreadAttribute>) {
              const tagName = (path.parentPath.node as any).name.name;
              if (!isNeedTranform(tagName)) {
                return;
              }
              // 添加一个标志来跟踪是否已经处理过该节点
              if ((path.node as any).__processed_jsx_px_to_rem) {
                return;
              }
              (path.node as any).__processed_jsx_px_to_rem = true;
              shouldImportHelpFunction = true;
              wrapperCallPropsToRem(path.get("argument"));
            },
          },
          CallExpression: {
            exit(path: NodePath<babelTypes.CallExpression>) {
              // 添加一个标志来跟踪是否已经处理过该节点
              if ((path.node as any).__processed_jsx_px_to_rem) {
                return;
              }
              (path.node as any).__processed_jsx_px_to_rem = true;
              const callee = path.get("callee");
              if (callee.isMemberExpression()) {
                const calleeName = (callee.get("property.name") as any)?.node;
                if (!calleeName) return;
                if (calleeName === "createElement") {
                  if ((callee.get("object.name") as any).node !== "React")
                    return;
                } else {
                  if (
                    !["jsx", "jsxs"].some((name) => calleeName.endsWith(name))
                  )
                    return;
                }
              } else {
                const calleeName = (callee.get("name") as any).node;
                if (!calleeName) return;
                if (!["jsx", "jsxs"].some((name) => calleeName.endsWith(name)))
                  return;
              }
              const propsPath = path.get("arguments").at(1) as NodePath;
              const tagNamePath = path.get("arguments").at(0) as NodePath;
              const tagName =
                (tagNamePath.node as any)?.value ||
                (tagNamePath.node as any)?.name;
              if (!isNeedTranform(tagName)) return;
              if (propsPath && propsPath.node) {
                propsPath.traverse({
                  ObjectProperty: {
                    exit(path: NodePath<babelTypes.ObjectProperty>) {
                      if (isStyleAttibute((path.node.key as any).name)) {
                        // 添加一个标志来跟踪是否已经处理过该节点
                        if ((path.node as any).__processed_jsx_px_to_rem) {
                          return;
                        }
                        (path.node as any).__processed_jsx_px_to_rem = true;
                        shouldImportHelpFunction = true;
                        covertObjectExpressionToRem(path.get("value"));
                      }
                    },
                  },
                });
                if (!shouldImportHelpFunction) {
                  if (
                    propsPath.isNullLiteral() ||
                    propsPath.isTSUndefinedKeyword()
                  )
                    return;
                  shouldImportHelpFunction = true;
                  wrapperCallPropsToRem(
                    propsPath as NodePath<babelTypes.Expression>
                  );
                }
              }
            },
          },
        });
        if (shouldImportHelpFunction) {
          // 使用 template API 创建要插入的代码节点
          const buildFunction = template(
            `import { PX_TO_REM as ${PX_TO_REM_ALIAS}, COVERT_JSX_STYLE_TO_REM as ${COVERT_JSX_STYLE_TO_REM_ALIAS}, COVERT_JSX_PROPS_TO_REM as ${COVERT_JSX_PROPS_TO_REM_ALIAS} } from 'SOURCE';\n`
          );

          // 生成 AST 节点
          const importDeclaration = buildFunction({
            PX_TO_REM,
            COVERT_JSX_STYLE_TO_REM,
            COVERT_JSX_PROPS_TO_REM,
            SOURCE: LIB_NAME,
          });

          // 在文件的开头插入代码
          path.unshiftContainer("body", importDeclaration);
        }
      },
    },
  };
}
