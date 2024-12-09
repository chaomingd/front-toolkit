import { NodePath, types as babelTypes, template } from '@babel/core';
import pathLib from 'path';
export * from './nodeModulesInclude';

let shouldImportHelpFunction = false;

const LIB_NAME = pathLib.resolve(__dirname, './utils.js');
const COVERT_JSX_PROPS_TO_REM = 'covertJsxPropsToRem';
const COVERT_JSX_PROPS_TO_REM_ALIAS = '__jsx_inline_covertJsxPropsToRem';
const COVERT_JSX_CLONE_ELEMENT_PROPS_TO_REM = 'covertJsxCloneElementPropsToRem';
const COVERT_JSX_CLONE_ELEMENT_PROPS_TO_REM_ALIAS =
  '__jsx_inline_covertJsxCloneElementPropsToRem';

function wrapperCovertPropsToRem(
  path: NodePath<babelTypes.Expression>,
  functionName: string,
  tagNode: babelTypes.Expression,
) {
  path.replaceWith(
    babelTypes.callExpression(babelTypes.identifier(functionName), [
      tagNode,
      path.node,
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

const REACT_CALL_EXPRESSIONS = ['createElement', 'cloneElement'];
export default function () {
  return {
    visitor: {
      Program: {
        exit(path: NodePath<babelTypes.Program>) {
          shouldImportHelpFunction = false;
          path.traverse({
            CallExpression: {
              exit(path: NodePath<babelTypes.CallExpression>) {
                if ((path.node as any).__processed_jsx_px_to_rem) {
                  return;
                }
                (path.node as any).__processed_jsx_px_to_rem = true;
                let calleeName = '';
                const callee = path.get('callee');
                if (callee.isMemberExpression()) {
                  calleeName = (callee.get('property.name') as any)?.node;
                  if (!calleeName) return;
                  if (REACT_CALL_EXPRESSIONS.includes(calleeName)) {
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
                  calleeName = (callee.get('name') as any).node;
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
                wrapperCovertPropsToRem(
                  propsPath as NodePath<babelTypes.Expression>,
                  calleeName === 'cloneElement'
                    ? COVERT_JSX_CLONE_ELEMENT_PROPS_TO_REM_ALIAS
                    : COVERT_JSX_PROPS_TO_REM_ALIAS,
                  tagNamePath.node as babelTypes.Expression,
                );
              },
            },
          });
          if (shouldImportHelpFunction) {
            const buildFunction = template(
              `import { COVERT_JSX_PROPS_TO_REM as ${COVERT_JSX_PROPS_TO_REM_ALIAS}, COVERT_JSX_CLONE_ELEMENT_PROPS_TO_REM as ${COVERT_JSX_CLONE_ELEMENT_PROPS_TO_REM_ALIAS} } from 'SOURCE';\n`,
            );
            path.unshiftContainer(
              'body',
              buildFunction({
                COVERT_JSX_PROPS_TO_REM,
                COVERT_JSX_CLONE_ELEMENT_PROPS_TO_REM,
                SOURCE: LIB_NAME,
              }),
            );
          }
        },
      },
    },
  };
}
