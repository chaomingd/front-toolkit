import transform from './transform';

describe('jsx-style', () => {
  it('should convert px to rem in style attribute', () => {
    const input = `
      import { jsx as _jsx } from 'react/jsx-runtime';
      _jsx('div', { style: { width: '16px', height: '32px' } });
    `;
    const output = transform(input);
    expect(output).toMatch(/width:[\s\S]*rem/);
    expect(output).toMatch(/height:[\s\S]*rem/);
  });

  it('should ignore custom components', () => {
    const input = `
      import { jsx as _jsx } from 'react/jsx-runtime';
      _jsx(CustomComponent, { style: { width: '16px' } });
    `;
    const output = transform(input);
    expect(output).toContain(`width: '16px'`);
  });

  it('should handle numeric values', () => {
    const input = `
      import { jsx as _jsx } from 'react/jsx-runtime';
      _jsx('div', { style: { margin: 16 } });
    `;
    const output = transform(input);
    expect(output).toMatch(/margin:[\s\S]*rem/);
  });

  it('should handle line-height', () => {
    const input = `
      import { jsx as _jsx } from 'react/jsx-runtime';
      _jsx('div', { style: { lineHeight: '16px' } });
    `;
    const output = transform(input);
    expect(output).toMatch(/lineHeight:[\s\S]*rem/);
  });

  it('should handle mixed static and dynamic styles', () => {
    const input = `
      import { jsx as _jsx } from 'react/jsx-runtime';
      const dynamicPadding = '20px';
      _jsx('div', { style: { margin: '10px', padding: dynamicPadding } });
    `;
    const output = transform(input);
    expect(output).toMatch(/margin:[\s\S]*rem/);
    expect(output).toMatch(/covertStylePropertyToRem[\s\S]*dynamicPadding, "padding"/);
  });

  it('should ignore non-px dynamic values', () => {
    const input = `
      import { jsx as _jsx } from 'react/jsx-runtime';
      const dynamicColor = 'red';
      _jsx('div', { style: { color: dynamicColor } });
    `;
    const output = transform(input);
    expect(output).toMatch(/covertStylePropertyToRem[\s\S]*dynamicColor, "color"/);
  });

  it('should handle complex expressions in dynamic style', () => {
    const input = `
      import { jsx as _jsx } from 'react/jsx-runtime';
      const baseSize = 8;
      _jsx('div', { style: { width: \`\${baseSize * 2}px\`, height: \`\${baseSize * 4}px\` } });
    `;
    const output = transform(input);
    expect(output).toMatch(/covertStylePropertyToRem[\s\S]*"width"/);
    expect(output).toMatch(/covertStylePropertyToRem[\s\S]*"height"/);
  });

  it('should handle complex props', () => {
    const input = `
      import { jsx as _jsx } from 'react/jsx-runtime';
      const props = { style: { lineHeight: 1.3 } }
      _jsx('div', props);
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*props/);
  });

  it('should handle complex props 2', () => {
    const input = `
      import { jsx as _jsx } from 'react/jsx-runtime';
      const props = { style: { lineHeight: 1.3 } }
      _jsx('div', {...{ style: props.style }});
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*props.style/);
  });
});