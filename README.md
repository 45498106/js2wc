# js2wc
Wrap js into wasm cpp source code to make it can be compiled with emcc

# Why js2wc  

We want to protected our code 

# Workflow 

1. Run **`npm init`** in a empty directory
1. Create a file named main.js and input code **`console.log("Hello World");`**
1. Run **`node node_modules/js2wc/cli.js --input=main.js`**, this will create a file named **`main.cpp`**
1. Run **`emcc -std=c++11 -Wall --bind main.cpp`**, this will create two files named **`a.out.js`** and **`a.wasm.js`**
1. Run **`node a.out.js`**, this will print **`Hello World`** to console