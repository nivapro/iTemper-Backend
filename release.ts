"use strict";
import * as shell from "shelljs";
const version = require("./package").version;
const name = require("./package").name;

console.log("--- releasing " + name + " version: ", version);

const archiveName = name + "_" + version + ".tar";
const compressedArchiveName = archiveName + ".gz";
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
    console.log("*** release failed: existing release found: " + releasePath);
    shell.exit(1);
}

if (!shell.test("-d", releaseFolder)) {
    shell.mkdir(releaseFolder);
    console.log("+++ created release folder" + releaseFolder);
}

let releaseFiles = "";
for (const releaseFile of content) {
    releaseFiles += " " + releaseFile;

}
console.log("--- archiving files and folders:", releaseFiles);

if (shell.exec("tar cf -" + releaseFiles + "| gzip > " + releasePath).code !== 0) {
    shell.echo("*** tar failed creating compressed archive: ", releasePath);
    shell.exit(1);
}

console.log("+++ released " + name + " version: " + version);
