import * as util from './util';
import * as path from 'path';
import * as fs from 'fs';

type RushConfig = {
    projects: {
      projectFolder: string;
    }[];
  };
  
export const getProjects = async () => {
    const rushJson: RushConfig = util.loadJSONfile('rush.json')
    const rushProjects = await Promise.all(
      rushJson.projects.map(({ projectFolder }) => {
        const p = path.join(__dirname, projectFolder, "package.json");
        if (!fs.existsSync(p)) {
          throw new Error("Could not find package.json on path: " + p);
        }
        return { projectFolder };
      })
    );
    console.debug(`Found ${rushProjects.length} rush projects configured`);
    return rushProjects;
  };
  