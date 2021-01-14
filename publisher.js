const readArgs = require("arg");

const { readFileSync: read, writeFileSync: write } = require("fs");
const { not } = require("logical-not");
const { question } = require("readline-sync");
const { cd, echo, exec, exit, which } = require("shelljs");

const args = readArgs({ "--patch": String, "--no-git-push": Boolean });

// Set current directory

cd(__dirname);

// Check NPM User

const currentNpmUser = exec("npm whoami", { silent: true }).toString().trim();

const answer = question(
    `Please confirm publishing by user "${currentNpmUser}" [Y/n] `,
)
    .toString()
    .trim()
    .toLowerCase();

if (not(["yes", "y"].includes(answer))) exit(0);

// Test
echo("Test running...");

exec("npm run test");

echo("Test complete");

// Dependencies

echo("Dependencies copying...");

const dependenciesMatcher = /"dependencies"\s*:\s*{(?:[^}])*}/;

const [dependencies] = read("package.json")
    .toString()
    .match(dependenciesMatcher);

const packageJson = read("package/package.json")
    .toString()
    .replace(dependenciesMatcher, dependencies);

write("package/package.json", packageJson);

echo("Dependencies copied");

// Go to package directory

cd("package");

// Patch version if --patch

let { "--patch": patchType } = args;

if (not(["major", "minor", "patch"].includes(patchType))) {
    if (patchType) echo(`--patch="${patchType}" is invalid and ignoring`);

    patchType = null;
}

if (patchType) {
    echo(`Version patching by --patch="${patchType}"`);

    exec(`npm version ${patchType}`);

    echo("Version patched");
}

// Deploy

echo("Deploying...");

exec("npm deploy");

echo("Deploy complete");

// Patch version if NOT --patch

if (not(patchType)) {
    echo("Version patching...");

    exec(`npm version patch`);

    echo("Version patched");
}

// Git push

if (not(args["--no-git-push"]) && which("git")) {
    echo("Pushing to Git...");

    exec(`git push`);

    echo("Git Push complete");
}

// Complete

echo("Successful complete");
