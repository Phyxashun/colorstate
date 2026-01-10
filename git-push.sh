#!/bin/bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display title box
echo -e "${BLUE}"
echo "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒"
echo "▒                                        ▒"
echo "▒         GIT PUSH AUTOMATION            ▒"
echo "▒                                        ▒"
echo "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒"
echo -e "${NC}\n"

echo
echo -e "${GREEN}Starting git push process...${NC}\n"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not a git repository${NC}\n"
    exit 1
fi

# Check for uncommitted changes
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}No changes to commit${NC}\n"
    exit 0
fi

# Show what will be staged
echo -e "${YELLOW}Changes to be committed:${NC}\n"
git status -s

# Stage all changes
git add .
echo -e "${GREEN}✓ Staged all changes${NC}\n"

# Get commit message
if [[ -n "$1" ]]; then
    COMMIT_MSG="$1"
else
    echo -e "${YELLOW}Enter commit message (or press Enter for default):${NC}"
    read -r COMMIT_MSG
    if [[ -z "$COMMIT_MSG" ]]; then
        COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
fi

# Commit changes
git commit -m "$COMMIT_MSG"
echo -e "\n${GREEN}✓ Committed changes${NC}\n"

# Get current branch
BRANCH=$(git branch --show-current)

# Push to remote
echo -e "${YELLOW}Pushing to origin/${BRANCH}...${NC}\n"
git push origin "$BRANCH"

echo -e "\n${GREEN}✓ Git push process completed successfully!${NC}\n"