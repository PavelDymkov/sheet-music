const readArgs = require("arg");
const chalk = require("chalk");

const { cd, exec, exit } = require("shelljs");
const { readFileSync: read, writeFileSync: write } = require("fs");
const { not } = require("logical-not");

if (not(exec("git branch").stdout.includes("master"))) {
    console.log(chalk.red.bold("Error!"));
    console.log(chalk.red("git branch not master"));

    exit(0);
}

const args = readArgs({ "--version": String });

exec("npm run test");

const dependenciesMatcher = /"dependencies"\s*:\s*{(?:[^}])*}/;

const [dependencies] = read("package.json")
    .toString()
    .match(dependenciesMatcher);

const packageJson = read("package/package.json")
    .toString()
    .replace(dependenciesMatcher, dependencies);

write("package/package.json", packageJson);

cd("package");

let { "--version": versionAction } = args;

if (not(["major", "minor"].includes(versionAction))) {
    versionAction = "patch";
}

exec(`npm version ${versionAction}`);
exec(`npm publish`);

cd("..");

exec(`git push`);
