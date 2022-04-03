export interface MappingObject {
  generatedLine: number;
  generatedColumn: number;
  sourceIndex: number;
  originalLine: number;
  originalColumn: number;
  nameIndex: number;
}

export interface UnmappedMapping {
  generatedLine: number;
  generatedColumn: number;

  sourceIndex?: undefined;
  originalLine?: undefined;
  originalColumn?: undefined;
  nameIndex?: undefined;
}

export interface UnnamedMapping {
  generatedLine: number;
  generatedColumn: number;
  sourceIndex: number;
  originalLine: number;
  originalColumn: number;

  nameIndex?: undefined;
}

type MappingInput = MappingObject | UnmappedMapping | UnnamedMapping;

export function readObject(mappings: Int32Array, index: number): MappingObject {
  return {
    generatedLine: mappings[index++],
    generatedColumn: mappings[index++],
    sourceIndex: mappings[index++],
    originalLine: mappings[index++],
    originalColumn: mappings[index++],
    nameIndex: mappings[index++],
  };
}

export function writeObject(
  mappings: Int32Array,
  index: number,
  object: MappingInput
) {
  mappings[index++] = object.generatedLine;
  mappings[index++] = object.generatedColumn;
  mappings[index++] = object.sourceIndex ?? -1;
  mappings[index++] = object.originalLine ?? -1;
  mappings[index++] = object.originalColumn ?? -1;
  mappings[index++] = object.nameIndex ?? -1;
}
