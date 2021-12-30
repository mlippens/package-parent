import * as fs from "fs";
import * as path from "path";
import * as json5 from "json5";
import parseArgs from 'minimist';
import { merge } from "lodash";

const findFile = (file: string) => {
  let p = path.resolve(__dirname);
  let foundRushConfig = false;
  do {
    const [exists] = fs.readdirSync(p).filter((f) => f === file);
    if (p === path.sep) {
      throw new Error(`Could not find file ${file}`);
    }
    if (!exists) {
      console.debug("Could not find path, resolving ..", p);
      p = path.resolve(p, "..");
    } else {
      foundRushConfig = true;
    }
  } while (!foundRushConfig);
  if (!foundRushConfig) {
    throw new Error(`Could not find ${file} file`);
  }
  return p;
};

type RushConfig = {
  projects: {
    projectFolder: string;
  }[];
};

type Project = {
  projectFolder: string
  packageJson: string
}

const getRushProjects = async () => {
  const rushPath = findFile("rush.json");
  const rushJson: RushConfig = json5.parse(
    fs.readFileSync(path.join(rushPath, "rush.json"), { encoding: "utf-8" })
  );
  const rushProjects = await Promise.all(
    rushJson.projects.map(({ projectFolder }) => {
      const p = path.join(rushPath, projectFolder, "package.json");
      if (!fs.existsSync(p)) {
        throw new Error("Could not find package.json on path: " + p);
      }
      return { projectFolder, packageJson: p };
    })
  );
  console.debug(`Found ${rushProjects.length} rush projects configured`);
  return rushProjects;
};

const config = {
  packages: {
    match: /\@app\/.*$/,
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

const main = async () => {
  const argv = parseArgs(process.argv.slice(2));
  
  let projects : Project[] = [];
  if (argv.rush === true) {
    projects = await getRushProjects();
  }

  await Promise.all(
    Object.entries(config).map(async ([key, config]) => {
      console.info(`processing config=[${key}]`);
      await Promise.all(
        projects
          .filter((p) => config.match.test(p.projectFolder))
          .map((project) => {
            const packageJson = json5.parse(
              fs.readFileSync(project.packageJson, { encoding: "utf-8" })
            );
            const mergedConfig = merge(packageJson, config.parent);
            fs.writeFileSync(
              project.packageJson,
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
