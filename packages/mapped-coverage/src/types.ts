type V8Function = {
  functionName: string;
  ranges: V8Range[];
  isBlockCoverage: boolean;
};

type V8Range = { startOffset: 0; endOffset: 0; count: 1 };

export type V8Coverage = {
  scriptId: string;
  url: string;
  functions: V8Function[];
};

export type ChromeBasicCoverage = {
  url: string;
  ranges: {
    start: number;
    end: number;
  }[];
};
