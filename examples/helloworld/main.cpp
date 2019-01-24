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

    auto str = LR"(console.log("Hello World"))";
    auto FunctionClass = emscripten::val::global("Function");
    auto func = FunctionClass.new_(val("require"),val("module"),std::wstring(str));
    auto appContext = emscripten::val::global(appContextName.c_str());
    func(appContext["require"],appContext["module"]);
    return 0;
}
