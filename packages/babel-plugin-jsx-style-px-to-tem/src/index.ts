import { NodePath, types as babelTypes, template } from '@babel/core';
import fs from 'fs';
import pathLib from 'path';
import {
  covertStylePropertyToRem,
  inlineCssPxToRemOptions,
  // isCustomComponent,
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

function covertStyleObjectExpressionToRem(
  path: NodePath,
  tagNode?: babelTypes.Expression,
) {
  if (
    !path.isObjectExpression() ||
    (tagNode && !babelTypes.isStringLiteral(tagNode))
  ) {
    wrapperJsxStyleToRem(path as NodePath<babelTypes.Expression>, tagNode);
    return;
  }
  if (tagNode && tagNode.value && !isNeedTranform(tagNode.value)) return;
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
    wrapperStylePropertyExpressionToRem(
      value,
      babelTypes.stringLiteral(keyName),
    );
  });
}

function wrapperJsxStyleToRem(
  path: NodePath<babelTypes.Expression>,
  tagNode?: babelTypes.Expression,
) {
  path.replaceWith(
    babelTypes.callExpression(
      babelTypes.identifier(COVERT_JSX_STYLE_TO_REM_ALIAS),
      tagNode ? [path.node, tagNode] : [path.node],
    ),
  );
  shouldImportHelpFunction = true;
}

function wrapperCallPropsToRem(
  path: NodePath<babelTypes.Expression>,
  tagNode?: babelTypes.Expression,
) {
  path.replaceWith(
    babelTypes.callExpression(
      babelTypes.identifier(COVERT_JSX_PROPS_TO_REM_ALIAS),
      tagNode ? [path.node, tagNode] : [path.node],
    ),
  );
  shouldImportHelpFunction = true;
}

function wrapperStylePropertyExpressionToRem(
  path: NodePath<babelTypes.Expression>,
  propertyNameNode: babelTypes.Expression,
) {
  path.replaceWith(
    babelTypes.callExpression(babelTypes.identifier(PX_TO_REM_ALIAS), [
      path.node,
      propertyNameNode,
    ]),
  );
  shouldImportHelpFunction = true;
}

function findStylePropertyPaths(
  path: NodePath<babelTypes.ObjectExpression>,
): NodePath<babelTypes.ObjectProperty>[] {
  const properties = path.get('properties');
  let stylePaths: NodePath<babelTypes.ObjectProperty>[] = [];
  if (!properties || !properties.length) return stylePaths;
  properties.forEach((property) => {
    if (property.isObjectProperty()) {
      const key = property.get('key') as NodePath<babelTypes.Identifier>;
      if (!key.node) return;
      const keyName = key.node.name;
      if (isStyleAttribute(keyName)) {
        stylePaths.push(property);
      }
    } else if (property.isSpreadElement()) {
      const argument = property.get(
        'argument',
      ) as NodePath<babelTypes.ObjectExpression>;
      if (argument.isObjectExpression()) {
        stylePaths.push(...findStylePropertyPaths(argument));
      }
    }
  });
  return stylePaths;
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
        exit(path: NodePath<babelTypes.Program>) {
          shouldImportHelpFunction = false;
          path.traverse({
            // JSXAttribute: {
            //   enter(path: NodePath<babelTypes.JSXAttribute>) {
            //     const atributName = path.node.name.name as string;
            //     const tagPath = path.parentPath.get(
            //       'name',
            //     ) as NodePath<babelTypes.JSXIdentifier>;
            //     if (!tagPath || !tagPath.node) return;
            //     const tagName = tagPath.node.name as string;
            //     if (!tagName) return;
            //     const expression = path.get('value').get('expression');
            //     if (!expression) return;
            //     const tagNode = isCustomComponent(tagName)
            //       ? babelTypes.identifier(tagName)
            //       : babelTypes.stringLiteral(tagName);
            //     if (!isStyleAttribute(atributName)) {
            //       return;
            //     }
            //     if ((path.node as any).__processed_jsx_px_to_rem) {
            //       return;
            //     }
            //     (path.node as any).__processed_jsx_px_to_rem = true;
            //     covertStyleObjectExpressionToRem(
            //       expression as NodePath<babelTypes.ObjectProperty>,
            //       tagNode,
            //     );
            //   },
            // },
            // JSXSpreadAttribute: {
            //   enter(path: NodePath<babelTypes.JSXSpreadAttribute>) {
            //     const tagPath = path.parentPath.get(
            //       'name',
            //     ) as NodePath<babelTypes.JSXIdentifier>;
            //     if (!tagPath || !tagPath.node) return;
            //     if ((path.node as any).__processed_jsx_px_to_rem) {
            //       return;
            //     }
            //     (path.node as any).__processed_jsx_px_to_rem = true;
            //     const tagName = tagPath.node.name;
            //     const tagNode = isCustomComponent(tagName)
            //       ? babelTypes.identifier(tagName)
            //       : babelTypes.stringLiteral(tagName);
            //     let isTransformed = false;
            //     if (path.get('argument').isObjectExpression()) {
            //       const stylePropertyPaths = findStylePropertyPaths(
            //         path.get(
            //           'argument',
            //         ) as NodePath<babelTypes.ObjectExpression>,
            //       );
            //       stylePropertyPaths.forEach((stylePropertyPath) => {
            //         if (stylePropertyPath) {
            //           covertStyleObjectExpressionToRem(
            //             stylePropertyPath.get(
            //               'value',
            //             ) as NodePath<babelTypes.ObjectExpression>,
            //             tagNode,
            //           );
            //           isTransformed = true;
            //         }
            //       });
            //     }
            //     if (isTransformed) return;
            //     wrapperCallPropsToRem(path.get('argument'), tagNode);
            //   },
            // },
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
                const propsPath = path.get('arguments').at(1) as NodePath;
                if (
                  !tagNamePath ||
                  !tagNamePath.node ||
                  !propsPath ||
                  !propsPath.node
                ) {
                  return;
                }
                if (!tagNamePath.isStringLiteral()) {
                  wrapperCallPropsToRem(
                    propsPath as NodePath<babelTypes.Expression>,
                    tagNamePath.node as babelTypes.Expression,
                  );
                  return;
                }

                const tagName = tagNamePath.node.value;
                if (!isNeedTranform(tagName)) return;
                if (!propsPath || !propsPath.node) {
                  return;
                }
                let isTransformed = false;
                if (propsPath.isObjectExpression()) {
                  const stylePropertyPaths = findStylePropertyPaths(
                    propsPath as NodePath<babelTypes.ObjectExpression>,
                  );
                  stylePropertyPaths.forEach((stylePropertyPath) => {
                    if (stylePropertyPath) {
                      covertStyleObjectExpressionToRem(
                        stylePropertyPath.get(
                          'value',
                        ) as NodePath<babelTypes.ObjectExpression>,
                      );
                      isTransformed = true;
                    }
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
