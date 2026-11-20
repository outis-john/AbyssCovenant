#!/bin/sh
# 生成 web/index.html、docs/index.html、docs/abyss-offline.html
python3 "$(dirname "$0")/tools/build.py"
