const {js2wc, jsfile2wcfile} = require("./index");
const argv = require("yargs").argv;


if (!argv.input) {
    console.log("Usage: js2wc --input=main.js --output=main.cpp");
} else {
    jsfile2wcfile(argv.input, argv.output);
}