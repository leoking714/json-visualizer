declare module 'json-source-map' {
  export interface Entry {
    line: number;
    column: number;
    pos: number;
  }
  export interface PointerEntry {
    key?: Entry;
    keyEnd?: Entry;
    value?: Entry;
    valueEnd?: Entry;
  }
  export interface SourceMap {
    pointers: Record<string, PointerEntry>;
  }
  export function parse(json: string): SourceMap;
  export function stringify(data: any, replacer: any, space: any): { json: string; map: SourceMap };
  const jsonSourceMap: {
    parse: typeof parse;
    stringify: typeof stringify;
  };
  export default jsonSourceMap;
}
