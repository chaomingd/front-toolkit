export * from './createShouldTransformFunctionWithIgnoreClassNames';
export interface IncludeItem {
  componentName: string;
  libName?: string;
  properties: string[];
}
export interface inlineCssPxToRemOptions {
  rootValue?: number;
  unitPrecision?: number;
  minPixelValue?: number;
  shouldTransform?: (
    tagName: string,
    props: Record<string, any> | undefined | null,
    originalProps: Record<string, any> | undefined | null,
    isSvgChildElementTag: boolean,
  ) => boolean;
}

export let optionsConfig: inlineCssPxToRemOptions = {
  rootValue: 16,
  unitPrecision: 5,
  minPixelValue: 1,
};

declare global {
  interface Window {
    __babel_plugin_jsx_style_px_to_rem_options__: inlineCssPxToRemOptions;
  }
}

const SVG_TAGS = [
  "a",
  "animate",
  "animateMotion",
  "animateTransform",
  "circle",
  "clipPath",
  "cursor",
  "defs",
  "desc",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "font",
  "font-face",
  "font-face-format",
  "font-face-name",
  "font-face-src",
  "font-face-uri",
  "foreignObject",
  "g",
  "glyph",
  "glyphRef",
  "hkern",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "metadata",
  "missing-glyph",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "script",
  "set",
  "stop",
  "style",
  "svg",
  "switch",
  "symbol",
  "text",
  "textPath",
  "title",
  "tref",
  "tspan",
  "use",
  "view",
  "vkern"
];

const SVG_TAGS_MAP = SVG_TAGS.reduce((acc, tag) => {
  acc[tag] = true;
  return acc;
}, {} as Record<string, boolean>);

export function isSvgChildTag(name: string) {
  return (name !== 'svg' && SVG_TAGS_MAP[name]) || false;
}

export function setOptionsConfig(options: Partial<inlineCssPxToRemOptions>) {
  Object.assign(optionsConfig, options || {});
}

export function getOptionsConfig() {
  return optionsConfig as Required<inlineCssPxToRemOptions>;
}

export function getBaseFontSize(): number {
  return getOptionsConfig().rootValue;
}

const NO_UNIT_PROPERTYS = [
  'opacity',
  'zIndex',
  'fontWeight',
  'flexGrow',
  'flexShrink',
  'order',
  'gridRow',
  'gridColumn',
  'gridArea',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridTemplateAreas',
  'tabSize',
  'orphans',
  'widows',
];

const NO_UNIT_PROPERTYS_MAP = NO_UNIT_PROPERTYS.reduce((acc, key) => {
  acc[key] = true;
  return acc;
}, {} as Record<string, boolean>);

export const SPECIAL_PROPERTYS_COVERTER: Record<
  string,
  <V extends string | number>(value: V) => V
> = {
  lineHeight: covertLineHeightPropertyToRem,
};

export function isIgnoreUnitProperty(property: string): boolean {
  return NO_UNIT_PROPERTYS_MAP[property];
}

export function covertLineHeightPropertyToRem<V extends string | number>(
  value: V,
): V {
  if (typeof value === 'string' && value.endsWith('px')) {
    const pxValue = parseFloat(value.replace('px', ''));
    return pxtorem(pxValue) as V;
  }
  return value;
}

export function pxtorem(value: number): string {
  if (value === 0) return '0';
  if (
    getOptionsConfig().minPixelValue &&
    value < getOptionsConfig().minPixelValue
  ) {
    return `${value}px`;
  }
  return `${(value / getBaseFontSize()).toFixed(
    getOptionsConfig().unitPrecision,
  )}rem`;
}

export const PX_VALUE_REG = /(\d*(\.\d+)?)px/g;
export const NUMBER_REG = /^-?\d+(\.\d+)?$/;

export function covertStringPropertyToRem(value: string): string {
  return (
    value?.replace(PX_VALUE_REG, (_, p1) => {
      return pxtorem(parseFloat(p1));
    }) || ''
  );
}

export function isStyleAttribute(name: string) {
  return name === 'style';
}

const CUSTOM_COMPONENT_REG = /^[A-Z]/;

export function isCustomComponent(name: string): boolean {
  return CUSTOM_COMPONENT_REG.test(name);
}

export function covertStylePropertyToRem(
  value: string | number,
  key?: string,
): string | number {
  if (key) {
    const covertFn = SPECIAL_PROPERTYS_COVERTER[key];
    if (covertFn) {
      return covertFn(value) as string;
    }
  }
  if (typeof value === 'number') {
    return pxtorem(value);
  }
  return covertStringPropertyToRem(value);
}

function coverAttrValueToRem(value: number | string): string {
  if (typeof value === 'number') {
    return pxtorem(value);
  }
  if (NUMBER_REG.test(value)) {
    return pxtorem(parseFloat(value));
  }
  return covertStringPropertyToRem(value);
}

export function covertJsxStyleToRem(
  style: Record<string, any>,
): Record<string, string> {
  if (!style) return style;
  const newStyle: Record<string, any> = {};
  Object.keys(style).forEach((key) => {
    if (isIgnoreUnitProperty(key)) {
      newStyle[key] = style[key];
      return;
    }
    const value = style[key];
    if (!value) {
      newStyle[key] = value;
      return;
    }
    newStyle[key] = covertStylePropertyToRem(value, key);
  });
  return newStyle;
}

export function covertJsxPropsToRem(tag: any, props: Record<string, any> | undefined | null, propsInfo: Record<string, any> | undefined | null) {
  if (!props) return props;
  if (typeof tag !== 'string')
    return props;
  const isSvgChildElementTag = isSvgChildTag(tag);
  const shouldTransform = getOptionsConfig().shouldTransform;
  if (shouldTransform) {
    if (!shouldTransform(tag, props, propsInfo || props, isSvgChildElementTag)) {
      return props;
    }
  } else {
    if (isSvgChildElementTag) {
      return props;
    }
  }

  if (props.style) {
    props.style = covertJsxStyleToRem(props.style);
  }

  if (props.width) {
    props.width = coverAttrValueToRem(props.width);
  }
  if (props.height) {
    props.height = coverAttrValueToRem(props.height);
  }
  return props;
}

export function covertJsxCloneElementPropsToRem(
  element: { type: any, props?: Record<string, any> },
  props: Record<string, any>,
) {
  if (!props || !element.type) return props;
  if (typeof element.type !== 'string') return props;
  return covertJsxPropsToRem(element.type, props, element.props);
}

