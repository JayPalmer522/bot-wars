@echo off
if [%1]==[] goto usage
git add .
git commit -m %1
git push origin main
goto done
:usage
echo Usage: push "notes on this change"
:done
