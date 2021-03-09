const readArgs = require("arg");
const chalk = require("chalk");

const { cd, cp, exec, exit } = require("shelljs");
const { readFileSync: read, writeFileSync: write } = require("fs");
const { not } = require("logical-not");

if (not(exec("git branch").stdout.includes("master"))) {
    console.log(chalk.red.bold("Error!"));
    console.log(chalk.red("git branch not master"));

    exit(0);
}

runBuild: {
    exec("npm run build");
}

runTest: {
    // exec("npm run test");
}

copyNonCodePackageFiles: {
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

publish: {
    cd("package");

    exec("npm publish");

    cd("..");
}

exec("git push");
