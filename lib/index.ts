import * as fs from "fs";
import * as path from "path";
import parseArgs from 'minimist';
import ow from 'ow';
import { merge } from "lodash";
import * as rush from './rush';
import * as util from './util'


type Project = {
  projectFolder: string
}

const getFolders = (p: string) => {
  return fs
    .readdirSync(p, { withFileTypes: true })
    .filter(f => f.isDirectory())
    .map(f => f.name);
}

const exclusions = ['node_modules'];

const findProjects = (p: string) => {
  let currentFolders = getFolders(p).filter(f => !exclusions.includes(f));
  let projects: Project[] = [];
  while (currentFolders.length > 0) {
    const c = currentFolders.pop() as string;
    if (!fs.existsSync(path.join(c, 'package.json'))) {
      getFolders(c)
        .filter(f => !exclusions.includes(f))
        .forEach(f => currentFolders.push(path.join(c, f)));
    } else {
      projects.push({ projectFolder: path.join(p, c) });
    }
  }
  return projects;
}

const configPredicate = ow.object.exactShape({
  packages: ow.array.nonEmpty.ofType(ow.object.exactShape({ 
    folder: ow.string.nonEmpty,
    parent: ow.object.nonEmpty, 
  })),
});


const main = async () => {
  const argv = parseArgs(process.argv.slice(2));
  let projects : Project[] = [];
  if (argv.rush === true) {
    projects = await rush.getProjects();
  } else {
    projects = findProjects(process.cwd());
  }

  if (!argv.c && !argv.config) {
    throw new Error('Expected a -c or --config <config.json> parameter to invoke package-parent!');
  }
  const config = util.loadJSONfile(path.resolve(process.cwd(), argv.c || argv.config));
  ow(config, configPredicate);
  console.info("projects", projects);

  await Promise.all(
    config.packages.map(async (c) => {
      console.info(`processing config=[${c.folder}]`);
      await Promise.all(
        projects
          .filter((p) => p.projectFolder.endsWith(c.folder))
          .map((project) => {
            const packageJsonPath = path.join(project.projectFolder, 'package.json');
            const mergedConfig = merge(util.loadJSONfile(packageJsonPath), c.parent);
            util.writeJSONfile(packageJsonPath, mergedConfig);
            console.debug(
              `Writing package.json of package ${project.projectFolder}`
            );
          })
      );
    })
  );
};

main().catch(console.error);
