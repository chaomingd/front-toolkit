import { CONFIG_OPTIONS } from "./config";
export interface IncludeItem {
  componentName: string;
  libName?: string;
  properties: string[];
}
export interface inlineCssPxToRemOptions {
  rootValue?: number;
  unitPrecision?: number;
  minPixelValue?: number;
}

export let optionsConfig: inlineCssPxToRemOptions = {
  rootValue: 16,
  unitPrecision: 5,
  minPixelValue: 1,
};

if (CONFIG_OPTIONS) {
  Object.assign(optionsConfig, CONFIG_OPTIONS);
}

const SVG_TAGS = [
  "a",
  "animate",
  "animateMotion",
  "animateTransform",
  "circle",
  "clipPath",
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
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "metadata",
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
  "tspan",
  "use",
  "view",
  "g",
  "animate",
  "animateMotion",
  "animateTransform",
  "mpath",
  "set",
  "circle",
  "ellipse",
  "line",
  "polygon",
  "polyline",
  "rect",
  "a",
  "defs",
  "g",
  "marker",
  "mask",
  "missing-glyph",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "desc",
  "metadata",
  "title",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
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
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "font",
  "font-face",
  "font-face-format",
  "font-face-name",
  "font-face-src",
  "font-face-uri",
  "hkern",
  "vkern",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "use",
  "feDistantLight",
  "fePointLight",
  "feSpotLight",
  "clipPath",
  "defs",
  "linearGradient",
  "marker",
  "mask",
  "metadata",
  "pattern",
  "radialGradient",
  "script",
  "style",
  "symbol",
  "title",
  "linearGradient",
  "pattern",
  "radialGradient",
  "a",
  "circle",
  "ellipse",
  "foreignObject",
  "g",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "svg",
  "switch",
  "symbol",
  "text",
  "textPath",
  "tspan",
  "use",
  "g",
  "circle",
  "ellipse",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "defs",
  "g",
  "svg",
  "symbol",
  "use",
  "glyph",
  "glyphRef",
  "textPath",
  "text",
  "tref",
  "tspan",
  "textPath",
  "tref",
  "tspan",
  "clipPath",
  "cursor",
  "filter",
  "foreignObject",
  "script",
  "style",
  "view",
  "cursor",
  "font",
  "font-face",
  "font-face-format",
  "font-face-name",
  "font-face-src",
  "font-face-uri",
  "glyph",
  "glyphRef",
  "hkern",
  "missing-glyph",
  "tref",
  "vkern",
];

const SVG_TAGS_MAP = SVG_TAGS.reduce((acc, tag) => {
  acc[tag] = true;
  return acc;
}, {} as Record<string, boolean>);

export function isSvgTag(name: string) {
  return SVG_TAGS_MAP[name] || false;
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
  "opacity",
  "zIndex",
  "fontWeight",
  "flexGrow",
  "flexShrink",
  "order",
  "gridRow",
  "gridColumn",
  "gridArea",
  "gridTemplateColumns",
  "gridTemplateRows",
  "gridTemplateAreas",
  "tabSize",
  "orphans",
  "widows",
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
  value: V
): V {
  if (typeof value === "string" && value.endsWith("px")) {
    const pxValue = parseFloat(value.replace("px", ""));
    return pxtorem(pxValue) as V;
  }
  return value;
}

export function pxtorem(value: number): string {
  if (value === 0) return "0";
  if (getOptionsConfig().minPixelValue && value < getOptionsConfig().minPixelValue) {
    return `${value}px`;
  }
  return `${(value / getBaseFontSize()).toFixed(
    getOptionsConfig().unitPrecision
  )}rem`;
}

export const PX_VALUE_REG = /(\d*(\.\d+)?)px/g;

export function covertStringPropertyToRem(value: string): string {
  return value?.replace(PX_VALUE_REG, (_, p1) => {
    return pxtorem(parseFloat(p1));
  }) || '';
}

export function isStyleAttribute(name: string) {
  return name === "style";
}

const CUSTOM_COMPONENT_REG = /^[A-Z]/;

export function isCustomComponent(name: string): boolean {
  return CUSTOM_COMPONENT_REG.test(name);
}

export function covertStylePropertyToRem(
  value: string | number,
  key?: string
): string | number {
  if (key) {
    const covertFn = SPECIAL_PROPERTYS_COVERTER[key];
    if (covertFn) {
      return covertFn(value) as string;
    }
  }
  if (typeof value === "number") {
    return pxtorem(value);
  }
  return covertStringPropertyToRem(value);
}

export function covertJsxStyleToRem(
  style: Record<string, any>
): Record<string, string> {
  if (!style) return style;
  // const newStyle: Record<string, any> = {};
  Object.keys(style).forEach((key) => {
    if (isIgnoreUnitProperty(key)) {
      return;
    }
    const value = style[key];
    if (!value) {
      return;
    }
    style[key] = covertStylePropertyToRem(value, key);
  });
  return style;
}

export function covertJsxPropsToRem(props: Record<string, any>) {
  if (!props) return props;
  if (!("style" in props)) return props;
  props.style = covertJsxStyleToRem(props.style);
  return props;
}

export function isNeedTranform(tagName: string) {
  return tagName && !isCustomComponent(tagName) && !isSvgTag(tagName);
}
