const fs = require("fs");
const path = require("path");


/**
 * Warp js into cpp source code
 * @param jsStr js code input
 * @returns {string} cpp source code output
 */
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

function mkdirs(dirPath) {
    let parent = path.dirname(dirPath);
    if (!fs.existsSync(parent)) {
        mkdirs(parent);
    }
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
}

/**
 *
 * @param input Input file
 * @param output Output file
 */
function jsfile2wcfile(input, output) {
    if (!fs.existsSync(input)) {
        console.log(`Input file "${input}" not found.`);
        return;
    }
    output = output || `${path.basename(input, ".js")}.cpp`;
    mkdirs(path.dirname(output));
    fs.writeFileSync(output, js2wc(fs.readFileSync(input)));
}

module.exports = {
    js2wc: js2wc,
    jsfile2wcfile: jsfile2wcfile
};
