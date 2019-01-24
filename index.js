const fs = require("fs");
const path = require("path");


/**
 * Warp js into cpp source code
 * @param jsStr js code input
 * @returns {string} cpp source code output
 */
function js2wc(jsStr) {
    return `
#include <string>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <iostream>

using namespace emscripten;

int main(){
    srandom(static_cast<unsigned int>(time(nullptr)));
    long appContextId = random();
    EM_ASM({
        (function(){
            var appContextName = "top_yunp_app_context"+$0;
            var appContext = {};
            if (typeof global!=="undefined"){//support nodejs
                appContext.require=require;
                appContext.module=module;

                global[appContextName] = appContext;
            }
            if(typeof window==="object"){
                window[appContextName] = appContext;
            }
        })();
    },appContextId);

    std::string appContextName;
    appContextName+="top_yunp_app_context";
    appContextName+=std::to_string(appContextId);

    auto str = LR"(${jsStr})";
    auto FunctionClass = emscripten::val::global("Function");
    auto func = FunctionClass.new_(val("require"),val("module"),std::wstring(str));
    auto appContext = emscripten::val::global(appContextName.c_str());
    func(appContext["require"],appContext["module"]);
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
