import type { Config } from "@jest/types";

// Sync object
const config: Config.InitialOptions = {
  rootDir: "./test",
  transform: {
    "^.+\\.tsx?$": "esbuild-jest"
  }
};

export default config;
