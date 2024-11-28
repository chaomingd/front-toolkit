import { NodePath, types as babelTypes, template } from '@babel/core';
import fs from 'fs';
import pathLib from 'path';
import {
  covertStylePropertyToRem,
  inlineCssPxToRemOptions,
  isIgnoreUnitProperty,
  isNeedTranform,
  isStyleAttribute,
  setOptionsConfig,
} from './utils';
export * from './nodeModulesInclude';

let shouldImportHelpFunction = false;

const CONFIG_FILE_PATH = pathLib.resolve(__dirname, './config.js');
const LIB_NAME = pathLib.resolve(__dirname, './utils.js');
const PX_TO_REM = 'covertStylePropertyToRem';
const PX_TO_REM_ALIAS = '__jsx_inline_covertStylePropertyToRem';
const COVERT_JSX_STYLE_TO_REM = 'covertJsxStyleToRem';
const COVERT_JSX_STYLE_TO_REM_ALIAS = '__jsx_inline_covertJsxStyleToRem';
const COVERT_JSX_PROPS_TO_REM = 'covertJsxPropsToRem';
const COVERT_JSX_PROPS_TO_REM_ALIAS = '__jsx_inline_covertJsxPropsToRem';

function covertObjectExpressionToRem(path: NodePath) {
  if (!path.isObjectExpression()) {
    wrapperCallObjectExpressionToRem(path as NodePath<babelTypes.Expression>);
    return;
  }
  const properties = path.get(
    'properties',
  ) as NodePath<babelTypes.ObjectProperty>[];
  if (!properties || !properties.length) return;
  properties.forEach((property) => {
    const key = property.get('key') as NodePath<babelTypes.Identifier>;
    if (!key.node) return;
    const value = property.get('value') as NodePath<any>;
    const keyName = key.node.name;
    if (isIgnoreUnitProperty(keyName)) {
      return;
    }

    if (value.isStringLiteral() || value.isNumericLiteral()) {
      const remValue = covertStylePropertyToRem(value.node.value, keyName);
      value.replaceWith(
        typeof remValue === 'string'
          ? babelTypes.stringLiteral(remValue)
          : babelTypes.numericLiteral(remValue),
      );
      return;
    }
    wrapperCallExpressionToRem(value, babelTypes.stringLiteral(keyName));
  });
}

function wrapperCallObjectExpressionToRem(
  path: NodePath<babelTypes.Expression>,
) {
  path.replaceWith(
    babelTypes.callExpression(
      babelTypes.identifier(COVERT_JSX_STYLE_TO_REM_ALIAS),
      [path.node],
    ),
  );
  shouldImportHelpFunction = true;
}

function wrapperCallPropsToRem(path: NodePath<babelTypes.Expression>) {
  path.replaceWith(
    babelTypes.callExpression(
      babelTypes.identifier(COVERT_JSX_PROPS_TO_REM_ALIAS),
      [path.node],
    ),
  );
  shouldImportHelpFunction = true;
}

function wrapperCallExpressionToRem(
  path: NodePath<babelTypes.Expression>,
  keyNode: babelTypes.Expression,
) {
  path.replaceWith(
    babelTypes.callExpression(babelTypes.identifier(PX_TO_REM_ALIAS), [
      path.node,
      keyNode,
    ]),
  );
  shouldImportHelpFunction = true;
}

const JSX_CALL_EXPRESSIONS = [
  '_jsx',
  '_jsxs',
  'jsx',
  'jsxs',
  '_jsxDEV',
  'jsxDEV',
];

export default function (_: any, options: inlineCssPxToRemOptions) {
  if (options) {
    try {
      const optionsString = JSON.stringify(options);
      const configFileContent = fs.readFileSync(CONFIG_FILE_PATH).toString();
      fs.writeFileSync(
        CONFIG_FILE_PATH,
        configFileContent.replace(
          /(CONFIG_OPTIONS = )([\s\S]+)/,
          `$1${optionsString};\n`,
        ),
      );
    } catch (e) {}
  }
  setOptionsConfig(options);

  return {
    visitor: {
      Program: {
        enter(path: NodePath<babelTypes.Program>) {
          shouldImportHelpFunction = false;
          path.traverse({
            JSXAttribute: {
              enter(path: NodePath<babelTypes.JSXAttribute>) {
                const atributName = path.node.name.name as string;
                const tagName = (path.parentPath.node as any).name.name;
                if (
                  !isNeedTranform(tagName) ||
                  !isStyleAttribute(atributName)
                ) {
                  return;
                }
                const expression = path.get('value').get('expression');
                if (expression) {
                  if ((path.node as any).__processed_jsx_px_to_rem) {
                    return;
                  }
                  (path.node as any).__processed_jsx_px_to_rem = true;
                  covertObjectExpressionToRem(
                    expression as NodePath<babelTypes.ObjectProperty>,
                  );
                }
              },
            },
            JSXSpreadAttribute: {
              enter(path: NodePath<babelTypes.JSXSpreadAttribute>) {
                const tagName = (path.parentPath.node as any).name.name;
                if (!isNeedTranform(tagName)) {
                  return;
                }
                if ((path.node as any).__processed_jsx_px_to_rem) {
                  return;
                }
                (path.node as any).__processed_jsx_px_to_rem = true;
                wrapperCallPropsToRem(path.get('argument'));
              },
            },
            CallExpression: {
              exit(path: NodePath<babelTypes.CallExpression>) {
                if ((path.node as any).__processed_jsx_px_to_rem) {
                  return;
                }
                (path.node as any).__processed_jsx_px_to_rem = true;
                const callee = path.get('callee');
                if (callee.isMemberExpression()) {
                  const calleeName = (callee.get('property.name') as any)?.node;
                  if (!calleeName) return;
                  if (calleeName === 'createElement') {
                    if ((callee.get('object.name') as any).node !== 'React') {
                      return;
                    }
                  } else {
                    if (
                      !JSX_CALL_EXPRESSIONS.some((name) => calleeName === name)
                    ) {
                      return;
                    }
                  }
                } else {
                  const calleeName = (callee.get('name') as any).node;
                  if (!calleeName) return;
                  if (
                    !JSX_CALL_EXPRESSIONS.some((name) => calleeName === name)
                  ) {
                    return;
                  }
                }
                const tagNamePath = path.get('arguments').at(0) as NodePath;
                if (!tagNamePath.isStringLiteral()) return;
                const propsPath = path.get('arguments').at(1) as NodePath;
                const tagName =
                  (tagNamePath.node as any)?.value ||
                  (tagNamePath.node as any)?.name;
                if (!isNeedTranform(tagName)) return;
                if (!propsPath || !propsPath.node) {
                  return;
                }
                let isTransformed = false;
                if (propsPath.isObjectExpression()) {
                  propsPath.traverse({
                    ObjectProperty(path: NodePath<babelTypes.ObjectProperty>) {
                      if (!path.node.key) return;
                      const keyName = (path.node.key as any).name;
                      if (isStyleAttribute(keyName)) {
                        covertObjectExpressionToRem(path.get('value'));
                        isTransformed = true;
                      }
                    },
                  });
                }
                if (isTransformed) return;
                if (
                  propsPath.isNullLiteral() ||
                  propsPath.isTSUndefinedKeyword()
                ) {
                  return;
                }
                wrapperCallPropsToRem(
                  propsPath as NodePath<babelTypes.Expression>,
                );
              },
            },
          });
          if (shouldImportHelpFunction) {
            const buildFunction = template(
              `import { PX_TO_REM as ${PX_TO_REM_ALIAS}, COVERT_JSX_STYLE_TO_REM as ${COVERT_JSX_STYLE_TO_REM_ALIAS}, COVERT_JSX_PROPS_TO_REM as ${COVERT_JSX_PROPS_TO_REM_ALIAS} } from 'SOURCE';\n`,
            );

            const importDeclaration = buildFunction({
              PX_TO_REM,
              COVERT_JSX_STYLE_TO_REM,
              COVERT_JSX_PROPS_TO_REM,
              SOURCE: LIB_NAME,
            });

            path.unshiftContainer('body', importDeclaration);
          }
        },
      },
    },
  };
}
