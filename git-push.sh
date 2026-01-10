#!/bin/bash

echo
echo "Starting git push process..."
git add .
echo

echo "Staged all changes."
echo
git commit -m "Automated commit"
echo
echo "Committed changes."
echo
git push origin main
echo
echo "Git push process completed."
echo