import json5 from 'json5';
import * as path from 'path';
import * as fs from 'fs';

export const loadJSONfile = (filePath: string) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Could not find file ${filePath}`);
    }
    return json5.parse(
      fs.readFileSync(filePath, { encoding: "utf-8" })
    );
  };

export const writeJSONfile = (p: string, file: Object) => {
  fs.writeFileSync(
    p,
    JSON.stringify(file, null, 4),
    { encoding: "utf-8"}
  );
}