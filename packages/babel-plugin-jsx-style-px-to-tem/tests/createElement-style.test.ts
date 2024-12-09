import transform from './transform';

describe('createElement-style', () => {
  it('should convert px to rem in style attribute', () => {
    const input = `
      React.createElement('div', { style: { width: '16px', height: '32px' } });
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*div[\s\S]*style/);
  });

  it('should handle complex props 2', () => {
    const input = `
      const props = { style: { lineHeight: 1.3 } }
      React.createElement('div', {...{ style: props.style }});
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*props.style/);
  });

  it('should covertJsxPropsToRem', () => {
    const input = `
      const Component = 'div';
      const props = { style: { lineHeight: 1.3 } }
      React.createElement(Component, {...{ style: props.style }});
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*Component[\s\S]*props.style/);
  });
});
