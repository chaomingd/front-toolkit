import transform from './transform';

describe('cloneElement-style', () => {
  it('should convert px to rem in style attribute', () => {
    const input = `
      const element = <div></div>
      React.cloneElement(element, { style: { width: '16px', height: '32px' } });
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxCloneElementPropsToRem[\s\S]*element[\s\S]*style/);
  });

  it('should handle complex props', () => {
    const input = `
      const element = <div></div>
      const props = { style: { lineHeight: 1.3 } }
      React.cloneElement(element, {...{ style: props.style }});
    `;
    const output = transform(input);
    console.log(output)
    expect(output).toMatch(/covertJsxCloneElementPropsToRem[\s\S]*props.style/);
  });

  it('should covertJsxCloneElementPropsToRem', () => {
    const input = `
      const element = <div></div>
      const props = { style: { lineHeight: 1.3 } }
      React.cloneElement(element, {...{ style: props.style }});
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxCloneElementPropsToRem[\s\S]*element[\s\S]*props.style/);
  });
});