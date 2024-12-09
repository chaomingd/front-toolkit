import transform from './transform';

describe('jsx.test', () => {
  it('wrapper covertJsxPropsToRem with div tagName', () => {
    const input = `
      const div = <div style={{width: 100, height: 100}}></div>
    `;
    const output = transform(input, {
      shouldTransform: () => true,
      rootValue: 16,
    });
    // console.log(output);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*div[\s\S]*style/);
  });

  it('wrapper covertJsxPropsToRem with CustomComponent', () => {
    const input = `
      const CustomComponent = 'div';
      const App = () => <CustomComponent style={{width: 100}}></CustomComponent>
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*CustomComponent[\s\S]*style/);
  });
});
