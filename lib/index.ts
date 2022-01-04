import * as fs from "fs";
import * as path from "path";
import * as json5 from "json5";
import parseArgs from 'minimist';
import { merge } from "lodash";
import { getProjects } from './rush'


type Project = {
  projectFolder: string
}

const config = {
  packages: {
    folder: '@app/',
    parent: {
      private: true,
      author: "Michael Lippens",
      scripts: {
        test: "jest -i",
        build: "tsc",
      },
    },
  },
};

const getFolders = (p: string) => {
  return fs
  .readdirSync(p, { withFileTypes: true })
  .filter(f => f.isDirectory())
  .map(f => f.name);
}

const findProjects = async (p: string) => {

  let currentFolders = getFolders(p);
  let current = 0;
  let projects = [];
  do {
    
    const foundPackages = currentFolders
      .map((f) => {
        return { projectFolder: f, exists: fs.existsSync(path.join(f, 'package.json')) }
      })
      .filter((e) => e.exists)
      .forEach(found => projects.push({ projectFolder: found.projectFolder }));
    
    currentFolders =  (await Promise.all(currentFolders.map((f) => getFolders(f)))).flat();
    current += 1;
  } while(current < 3);
  return projects;
}


const main = async () => {
  const argv = parseArgs(process.argv.slice(2));
  
  let projects : Project[] = [];
  if (argv.rush === true) {
    projects = await getProjects();
  } else {}

  await Promise.all(
    Object.entries(config).map(async ([key, config]) => {
      console.info(`processing config=[${key}]`);
      await Promise.all(
        projects
          .filter((p) => p.projectFolder.startsWith(config.folder))
          .map((project) => {
            const packageJson = json5.parse(
              fs.readFileSync(path.join(project.projectFolder, 'package.json'), { encoding: "utf-8" })
            );
            const mergedConfig = merge(packageJson, config.parent);
            fs.writeFileSync(
              path.join(project.projectFolder, 'package.json'),
              json5.stringify(mergedConfig, null, 4),
              { encoding: "utf-8" }
            );
            console.debug(
              `Writing package.json of package ${project.projectFolder}`
            );
          })
      );
    })
  );
};

main().catch(console.error);
