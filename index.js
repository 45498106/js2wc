const fs = require("fs");
const path = require("path");
const argv = require("yargs").argv;

function js2wc(jsStr) {
    return `
#include <iostream>
#include <string>
#include <emscripten.h>
#include <emscripten/bind.h>

int main(){
    auto str = LR"(${jsStr})";
    auto FunctionClass = emscripten::val::global("Function");
    auto func = FunctionClass.new_(std::wstring(str));
    func();
    return 0;
}`
}

function jsfile2wcfile(input, output) {
    if (!fs.existsSync(input)) {
        console.log(`Input file "${input}" not found.`);
        return;
    }
    output = output || `${path.basename(input, ".js")}.cpp`;
    fs.writeFileSync(output, js2wc(fs.readFileSync(input)));
}

if (!argv.input) {
    console.log("Usage: js2wc --input=main.js --output=main.cpp");
} else {
    jsfile2wcfile(argv.input, argv.output);
}