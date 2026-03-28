#!/bin/bash

cd ~/projects/moussawer

# Initialize git
git init
git branch -M main

# Add remote
git remote add origin git@github.com:ettersAy/moussawer.git

# Stage only tracked files (respects .gitignore)
git add .

# First commit with conventional format
git commit -m "chore: initial commit - Laravel 13 + Vue.js 3 + Sail + Playwright"

# Push to GitHub
git push -u origin main

exit
curl -X POST http://localhost/api/contact \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{"email":"tester@example.com", "msg":"Testing via Curl"}'
curl -X POST http://localhost/api/contact \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{"email":"tester@example.com", "msg":"Testing via Curl"}'
curl -X POST http://localhost/api/contact \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{"email":"tester@example.com", "msg":"Testing via Curl"}'
curl -X POST http://localhost/api/contact \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{"email":"tester@example.com", "msg":"Testing via Curl"}'
curl -X POST http://localhost/api/contact \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{"email":"tester@example.com", "msg":"Testing via Curl"}'
