#!/bin/sh
# 把最新的游戏复制到 docs/，供 GitHub Pages 发布
cp "$(dirname "$0")/web/index.html" "$(dirname "$0")/docs/index.html"
