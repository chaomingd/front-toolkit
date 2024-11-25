import transform from './transform';

describe('plugin-options', () => {
  it('config options test', () => {
    const input = `<div style={{ width: '100px' }} />`;
    const output = transform(input, {
      rootValue: 100,
      unitPrecision: 2,
    });
    expect(output).toMatch(/width:[\s\S]*1\.00rem/);
  });

  it('config options minPixelValue 2 border: 1px should ignore', () => {
    const input = `<div style={{ border: '1px solid #000' }} />`;
    const output = transform(input, {
      minPixelValue: 2,
    });
    expect(output).toMatch(/border:[\s\S]*1px/);
  })
});
