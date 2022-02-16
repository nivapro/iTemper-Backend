"use strict";
import * as shell from "shelljs";
import { version, name } from './package.json';

console.log("release.ts: releasing " + name + " version: ", version);

const archiveName = name + "_" + version + ".tar";

const releaseFolder = "./release/";
const archivePath = releaseFolder + archiveName;
const releasePath = archivePath + ".gz";

// Content
const content = [
    "dist",
    "LICENSE",
    "README.md",
    "package.json",
    "docker-compose.yml",
    "Dockerfile"
];

if (shell.test("-f", releasePath)) {
    console.log("release.ts: release failed: existing release found: " + releasePath);
    shell.exit(1);
}

if (!shell.test("-d", releaseFolder)) {
    shell.mkdir(releaseFolder);
    console.log("release.ts: created release folder" + releaseFolder);
}

let releaseFiles = "";
for (const releaseFile of content) {
    releaseFiles += " " + releaseFile;

}
console.log("release.ts: archiving files and folders:", releaseFiles);

if (shell.exec("tar cf -" + releaseFiles + "| gzip > " + releasePath).code !== 0) {
    shell.echo("release.ts:  *** tar failed creating compressed archive: ", releasePath);
    shell.exit(1);
}

console.log("release.ts: released " + name + " version: " + version);
