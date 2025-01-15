@echo off
:: 构建
call npm run build

:: 进入构建输出目录
cd dist

:: 初始化git
git init
git add -A
git commit -m "deploy"

:: 推送到gh-pages分支
git push -f https://github.com/chenzilong0828/chenzilong0828.github.io.git master:gh-pages

:: 返回上级目录
cd .. 