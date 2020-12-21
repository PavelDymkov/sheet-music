const { join } = require("path");
const { merge } = require("webpack-merge");

module.exports = (env = {}) => {
    const prod = {
        mode: "production",
    };

    const dev = {
        mode: "development",

        devtool: "inline-source-map",
    };

    const config = merge([
        env.production ? prod : dev,
        {
            output: {
                path: join(__dirname, "lib"),
                libraryTarget: "umd",
            },

            resolve: {
                extensions: [".ts"],
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        loader: "ts-loader",
                    },
                ],
            },
        },
    ]);

    return [
        merge([
            config,
            {
                entry: "./src/core/index.ts",
                output: {
                    filename: "index.js",
                },
            },
        ]),
        merge([
            config,
            {
                entry: "./src/renderer-svg/index.ts",
                output: {
                    filename: "renderer-svg.js",
                },
            },
        ]),
    ];
};
