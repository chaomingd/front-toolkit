import transform from './transform';

describe('createElement-style', () => {
  it('should convert px to rem in style attribute', () => {
    const input = `
      React.createElement('div', { style: { width: '16px', height: '32px' } });
    `;
    const output = transform(input);
    expect(output).toMatch(/width:[\s\S]*rem/);
    expect(output).toMatch(/height:[\s\S]*rem/);
  });

  it('should ignore custom components', () => {
    const input = `
      React.createElement(CustomComponent, { style: { width: '16px' } });
    `;
    const output = transform(input);
    expect(output).toContain(`width: '16px'`);
  });

  it('should handle numeric values', () => {
    const input = `
      React.createElement('div', { style: { margin: 16 } });
    `;
    const output = transform(input);
    expect(output).toMatch(/margin:[\s\S]*rem/);
  });

  it('should handle line-height', () => {
    const input = `
      React.createElement('div', { style: { lineHeight: '16px' } });
    `;
    const output = transform(input);
    expect(output).toMatch(/lineHeight:[\s\S]*rem/);
  });

  it('should handle mixed static and dynamic styles', () => {
    const input = `
      const dynamicPadding = '20px';
      React.createElement('div', { style: { margin: '10px', padding: dynamicPadding } });
    `;
    const output = transform(input);
    expect(output).toMatch(/margin:[\s\S]*rem/);
    expect(output).toMatch(/covertStylePropertyToRem[\s\S]*dynamicPadding, "padding"/);
  });

  it('should ignore non-px dynamic values', () => {
    const input = `
      const dynamicColor = 'red';
      React.createElement('div', { style: { color: dynamicColor } });
    `;
    const output = transform(input);
    expect(output).toMatch(/covertStylePropertyToRem[\s\S]*dynamicColor, "color"/);
  });

  it('should handle complex expressions in dynamic style', () => {
    const input = `
      const baseSize = 8;
      React.createElement('div', { style: { width: \`\${baseSize * 2}px\`, height: \`\${baseSize * 4}px\` } });
    `;

    const output = transform(input);
    expect(output).toMatch(/covertStylePropertyToRem[\s\S]*"width"/);
    expect(output).toMatch(/covertStylePropertyToRem[\s\S]*"height"/);
  });

  it('should handle complex props', () => {
    const input = `
      const props = { style: { lineHeight: 1.3 } }
      React.createElement('div', props);
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*props/);
  });

  it('should handle complex props 2', () => {
    const input = `
      const props = { style: { lineHeight: 1.3 } }
      React.createElement('div', {...{ style: props.style }});
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*props.style/);
  });
});