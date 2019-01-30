const fs = require("fs");
const path = require("path");


/**
 * Warp js into cpp source code
 * @param jsStr js code input
 * @returns {string} cpp source code output
 */
function js2wc(jsStr) {
    jsStr = Buffer.from(jsStr).toString("base64");
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
            if (typeof global==="object" && typeof require ==="function" ){
                appContext.require=require;
                appContext.module=module;
                appContext.__dirname = __dirname;
                appContext.__filename = __filename;
                
                appContext.base64Decode = function(input){
                    return Buffer.from(input,"base64").toString();
                };
                appContext.base64Encode = function(input){
                    return Buffer.from(input).toString("base64");
                };
                
                global[appContextName] = appContext;
            }else{
                appContext.base64Decode = atob;
                appContext.base64Encode = btoa;
                
                if(typeof importScripts==="function"){
                    self[appContextName] = appContext;
                }else{
                    window[appContextName] = appContext;
                }
            }
        })();
    },appContextId);

    std::string appContextName;
    appContextName+="top_yunp_app_context";
    appContextName+=std::to_string(appContextId);

    auto str = LR"(    
var theScriptString = base64Decode("${jsStr}");
var theFunc = new Function("require","module","__dirname","__filename",theScriptString);
theFunc(require,module,__dirname,__filename);
)";
    auto FunctionClass = emscripten::val::global("Function");
    auto func = FunctionClass.new_(val("require"),val("module"),val("__dirname"),val("__filename"),val("base64Encode"),val("base64Decode"),std::wstring(str));
    auto appContext = emscripten::val::global(appContextName.c_str());
    func(appContext["require"],appContext["module"],appContext["__dirname"],appContext["__filename"],appContext["base64Encode"],appContext["base64Decode"]);
    return 0;
}
`
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
