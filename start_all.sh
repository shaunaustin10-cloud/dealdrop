#!/bin/bash
. "$HOME/.sdkman/bin/sdkman-init.sh"
firebase emulators:start --import=./firebase-data --export-on-exit=./firebase-data &
npx vite --host
wait