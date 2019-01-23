#!/usr/bin/env bash
docker run --rm -ti -v `pwd`:/Source -w /Source xtiqin/emsdk emcc -std=c++11 -Wall --bind main.cpp