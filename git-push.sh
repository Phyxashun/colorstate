#!/bin/bash

echo "Starting git push process..."
git add .
echo "Staged all changes."
git commit -m "Automated commit"
echo "Committed changes."
git push origin main
echo "Pushed changes to remote repository." 
echo "Git push process completed."
