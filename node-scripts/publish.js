const readArgs = require("arg");
const chalk = require("chalk");

const { makeBadge } = require("badge-maker");
const { readFileSync: read, writeFileSync: write } = require("fs");
const { not } = require("logical-not");
const { basename, join } = require("path");
const { cd, cp, exec, exit, ls, rm } = require("shelljs");

/// Check current directory

if (process.cwd() !== join(__dirname, "..")) {
    error("invalid current directory");
}

/// Check git branch is master

if (not(exec("git branch").stdout.includes("master"))) {
    error("git branch is not master");
}

removeBadges: {
    rm("badges/*");
}

buildPackage: {
    exec("npm run build");

    createBadge("build", {
        label: "build",
        message: "passing",
    });
}

runTests: {
    const { code } = exec("npm run test");

    if (code !== 0) error("tests failed");

    createBadge("tests", {
        label: "tests",
        message: "passing",
    });
}

createPackageTemplate: {
    cp("-r", "src/package", "package");
}

increaseVersion: {
    let { "--version": versionAction } = readArgs({ "--version": String });

    if (not(["major", "minor"].includes(versionAction)))
        versionAction = "patch";

    exec(`npm version ${versionAction}`);

    // second version patch for odd version
    if (versionAction === "patch") exec(`npm version ${versionAction}`);
}

packageJsonUpdate: {
    const packageJSON = JSON.parse(read("package/package.json"));

    const { version, dependencies } = JSON.parse(read("package.json"));

    Object.assign(packageJSON, { version, dependencies });

    write("package/package.json", JSON.stringify(packageJSON, null, "    "));
}

deployBadges: {
    const badges = Array.from(ls("badges/*.svg")).map(path => {
        const fileName = basename(path, ".svg");

        return `![${fileName}](https://raw.githubusercontent.com/PavelDymkov/sheet-music/master/badges/${fileName}.svg)`;
    });

    const readme = read("package/README.md")
        .toString()
        .replace("<!-- Generated Badges -->", badges.join("\n"));

    write("package/README.md", readme);
}

publish: {
    cd("package");

    exec("npm publish");

    cd("..");
}

updateRepository: {
    exec("git push");
}

function error(message) {
    console.log(chalk.red.bold("Error!"));
    console.log(chalk.red(message));

    exit(0);
}

function createBadge(name, format) {
    const badge = makeBadge(format);

    write(`badges/${name}.svg`, badge);
}
