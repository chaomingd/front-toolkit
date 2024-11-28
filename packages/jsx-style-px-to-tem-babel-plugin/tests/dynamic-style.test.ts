import transform from './transform';

describe('dynamic-style', () => {
  it('should wrapper covertStylePropertyToRem', () => {
    const input = `
      var width = 100;
      var a = <div style={{ width, height: width + 100 }} />;
    `;
    const output = transform(input, {
      rootValue: 100,
      unitPrecision: 2,
    });
    expect(output).toMatch(/covertStylePropertyToRem[\s\S]*width, "width"/);
    expect(output).toMatch(
      /covertStylePropertyToRem[\s\S]*width \+ 100, "height"/,
    );
  });

  it('should wrapper covertJsxStyleToRem 1', () => {
    const input = `
      var style = {width: 100};
      var a = <div style={style} />;
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxStyleToRem[\s\S]*style/);
  });

  it('should wrapper covertJsxStyleToRem 2', () => {
    const input = `
      var style = {width: 100};
      var a = <div style={Object.assign({}, style)} />;
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxStyleToRem[\s\S]*style/);
  });

  it('should wrapper covertJsxStyleToRem 3', () => {
    const input = `
      var style = {width: 100};
      var a = <div {...{style: style}} />;
    `;
    const output = transform(input);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*style/);
  });

  it('should wrapper covertJsxPropsToRem', () => {
    const input = `
      var style = {width: 100};
      var a = <div {...style} />;
    `;
    const output = transform(input);
    // console.log(output);
    expect(output).toMatch(/covertJsxPropsToRem[\s\S]*style/);
  });
});
