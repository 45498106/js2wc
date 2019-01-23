#include <iostream>
#include <string>
#include <emscripten.h>
#include <emscripten/bind.h>

int main(){
    auto str = LR"(console.log("Hello World"))";
    auto FunctionClass = emscripten::val::global("Function");
    auto func = FunctionClass.new_(std::wstring(str));
    func();
    return 0;
}