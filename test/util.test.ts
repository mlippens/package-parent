import * as fs from 'fs';
import * as path from 'path';
import { loadJSONfile, writeJSONfile } from "../lib/util";

const resolveFile = (f: string) => path.join(__dirname, 'resources', f);

describe('#util', () => {
    describe('#loadJSONfile', () => {
        it('should load an existing json file with comments', () => {
            const file = loadJSONfile(resolveFile('test.jsonc'));
            expect(file).not.toBeNull();
            expect(file).toHaveProperty('answer');
        });
        it('should load an existing json file without comments', () => {
            const file = loadJSONfile(resolveFile('test.json'));
            expect(file).not.toBeNull();
            expect(file).toHaveProperty('answer');
        });
        it('should throw an error when attempting to load a nonexisting file', () => {
            expect(() => loadJSONfile(resolveFile('doesnotexist.json'))).toThrowErrorMatchingSnapshot();
        });
        it('should throw an error when attempting to load a non JSON file', () => {
            expect(() => loadJSONfile(resolveFile('test.txt'))).toThrowErrorMatchingSnapshot();
        }); 
    });
    describe('#writeJSONfile', () => {
        it('should write a json file', () => {
            const file = resolveFile('writetest.json');
            try { 
                const contents = { "answer": 42 };
                expect(() => writeJSONfile(file, contents)).not.toThrowError();
                expect(loadJSONfile(file)).toMatchObject({
                    ...contents,
                })
            } finally {
                fs.rmSync(file);
            }
        });
        it.todo('should fail writing a json file with a non JSON object');
        it.todo('should fail writing a json file to an invalid path');
    });
});