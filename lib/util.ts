import json5 from 'json5';
import * as path from 'path';
import * as fs from 'fs';

export const loadJSONfile = (file: string) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      throw new Error(`Could not find file ${file}`);
    }
    return json5.parse(
      fs.readFileSync(filePath, { encoding: "utf-8" })
    );
  };