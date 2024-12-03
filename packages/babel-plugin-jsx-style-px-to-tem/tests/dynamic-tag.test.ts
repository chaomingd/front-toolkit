import transform from './transform';

describe('dynamic-tag', () => {
  it('should convert px to rem in style attribute', () => {
    const input = `
      const Component = 'div';
      const style = { width: '100px' };
      const a = <Component style={style} />;
    `;
    const output = transform(input);
    // console.log(output);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*style[\s\S]*Component/);
  });

  it('should convert JSXSpreadAttribute', () => {
    const input = `
      const Component = 'div';
      const style = { width: '100px' };
      const otherStyle = { height: '100px' };
      const a = <Component {...{style}} {...{style: otherStyle}} />;
    `;
    const output = transform(input);
    // console.log(output);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*Component/);
  });
});
