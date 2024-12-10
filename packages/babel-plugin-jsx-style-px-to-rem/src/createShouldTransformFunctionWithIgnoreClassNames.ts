export function createShouldTransformFunctionWithIgnoreClassNames(
  ignoreClassNames: Array<
    | string
    | {
        className: string;
        exact?: boolean;
      }
  >,
) {
  const ignoreClassNamesReg = ignoreClassNames.map((cls) => {
    if (typeof cls === 'string') {
      return new RegExp(cls);
    }
    if (cls.exact) {
      return new RegExp(`\\b${cls.className}\\b`);
    }
    return new RegExp(cls.className);
  });
  return (_: string, props: Record<string, any> | undefined | null, originalProps: Record<string, any> | undefined | null, isSvgChildElementTag: boolean) => {
    if (isSvgChildElementTag) {
      return false;
    }
    const className = props?.className || originalProps?.className;
    if (className && ignoreClassNamesReg.some((reg) => reg.test(className))) {
      return false;
    }
    return true;
  };
}
