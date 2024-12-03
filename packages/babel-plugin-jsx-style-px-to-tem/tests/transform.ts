import * as babel from '@babel/core';
import plugin from '../src/index';
import { inlineCssPxToRemOptions } from '../src/utils'

const transform = (code: string, options?: inlineCssPxToRemOptions) => {
  return babel.transform(code, {
    plugins: [[plugin, options], '@babel/plugin-transform-runtime'],
    presets: ['@babel/preset-env', [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        development: true,
      }
    ]],
  })?.code;
};

export default transform;