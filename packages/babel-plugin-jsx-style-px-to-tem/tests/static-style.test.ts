import transform from './transform';

describe('static-style', () => {
  it('should convert px to rem in style attribute', () => {
    const input = `<div style={{ width: '16px', height: '32px' }} />`;
    const output = transform(input);
    expect(output).toMatch(/width:[\s\S]*rem/);
    expect(output).toMatch(/height:[\s\S]*rem/);
  });

  it('should ignore custom components', () => {
    const input = `<CustomComponent style={{ width: '16px' }} />`;
    const output = transform(input);
    expect(output).toContain(`width: '16px'`);
  });

  it('should handle numeric values', () => {
    const input = `<div style={{ margin: 16 }} />`;
    const output = transform(input);
    expect(output).toMatch(/margin:[\s\S]*rem/);
  });

  it('should handle line-height', () => {
    const input = `<div style={{ lineHeight: '16px' }} />`;
    const output = transform(input);
    expect(output).toMatch(/lineHeight:[\s\S]*rem/);
  });

  it('should ignore line-height with numeric values', () => {
    const input = `<div style={{ lineHeight: 1.3 }} />`;
    const output = transform(input);
    expect(output).toMatch(/lineHeight:[\s\S]*1.3/);
  });

  it('should handle any string property with px', () => {
    const input = `<div style={{ border: '1px solid black', flex: '0 0 300px' }} />`;
    const output = transform(input);
    expect(output).toMatch(/border:[\s\S]*rem/);
    expect(output).toMatch(/flex:[\s\S]*rem/);
  });
});