import transform from './transform';

describe('jsx-runtime', () => {
  it('wrapper covertJsxPropsToRem with div tagName', () => {
    const input = `
      import { jsx as _jsx } from 'react/jsx-runtime';
      _jsx('div', { style: { width: '16px', height: '32px' } });
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*div[\s\S]*style/);
  });

  it('wrapper covertJsxPropsToRem with CustomComponent', () => {
    const input = `
      import { jsx as _jsx } from 'react/jsx-runtime';
      _jsx(CustomComponent, { style: { width: '16px' } });
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*CustomComponent[\s\S]*style/);
  });
});
