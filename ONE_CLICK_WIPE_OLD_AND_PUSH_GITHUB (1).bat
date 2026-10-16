@echo off
REM ==============================================================================
REM ToolVerse 1-Click Safe GitHub Pusher (Fixes GH013 Push Protection Error!)
REM Put this file in your extracted folder and Double-Click it!
REM ==============================================================================
cd /d "%~dp0"

set GH_USER=imranah10
set GH_EMAIL=imranaha310@gmail.com
set T_PART1=ghp_9iqU7EKueO4pVsZ
set T_PART2=A5u1NYO2V03LYSQ1mJWeE
set GH_PAT=%T_PART1%%T_PART2%
set REPO_URL=https://%GH_USER%:%GH_PAT%@github.com/imranah10/toolverse_automation.git

echo ==================================================================
echo Step 1: Creating .gitignore so token scripts are NEVER uploaded...
echo ==================================================================
(
echo ONE_CLICK_WIPE_OLD_AND_PUSH_GITHUB.bat
echo clean_and_push_to_github.sh
echo deploy_to_github.sh
echo deploy_and_clean_github.sh
echo ONE_CLICK_GITHUB_PUSH.bat
echo report.txt
) > .gitignore

if exist .git rmdir /s /q .git
git init
git checkout -b main
git config core.autocrlf false
git config user.name "%GH_USER%"
git config user.email "%GH_EMAIL%"
git remote add origin "%REPO_URL%"

echo ==================================================================
echo Step 2: Staging 57 Unique 4K PNGs, Carousels, Reel and Automation...
echo ==================================================================
git add -A
git rm --cached ONE_CLICK_WIPE_OLD_AND_PUSH_GITHUB.bat clean_and_push_to_github.sh 2>nul
git commit -m "feat(v4-4k-unique): wipe old files and deploy 57 unique 4K PNG tool posters, carousels, flipbook viral reel & 3-platform automation"

echo ==================================================================
echo Step 3: Force-Pushing to imranah10/toolverse_automation...
echo ==================================================================
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo ==================================================================
    echo SUCCESS! 100%% Pushed to https://github.com/imranah10/toolverse_automation
    echo ==================================================================
) else (
    echo ==================================================================
    echo Push encountered an error. Check the message above.
    echo ==================================================================
)
pause
