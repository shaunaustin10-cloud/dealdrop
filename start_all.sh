#!/bin/bash
firebase emulators:start --import=./firebase-data --export-on-exit=./firebase-data &
npx vite --host
wait