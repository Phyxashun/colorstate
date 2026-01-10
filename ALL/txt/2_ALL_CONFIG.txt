

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: .vscode/launch.json ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "bun",
            "internalConsoleOptions": "neverOpen",
            "request": "launch",
            "name": "Debug File",
            "program": "${file}",
            "cwd": "${workspaceFolder}",
            "stopOnEntry": false,
            "watchMode": false
        },
        {
            "type": "bun",
            "internalConsoleOptions": "neverOpen",
            "request": "launch",
            "name": "Run File",
            "program": "${file}",
            "cwd": "${workspaceFolder}",
            "noDebug": true,
            "watchMode": false
        },
        {
            "type": "bun",
            "internalConsoleOptions": "neverOpen",
            "request": "attach",
            "name": "Attach Bun",
            "url": "ws://localhost:6499/",
            "stopOnEntry": false
        }
    ]
}




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: .vscode/launch.json ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: .vscode/settings.json ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




{
    "better-comments.tags": [
        {
            "tag": "!",
            "color": "#FF2D00",
            "strikethrough": false,
            "underline": false,
            "backgroundColor": "transparent",
            "bold": false,
            "italic": false
        },
        {
            "tag": "?",
            "color": "#3498DB",
            "strikethrough": false,
            "underline": false,
            "backgroundColor": "transparent",
            "bold": false,
            "italic": false
        },
        {
            "tag": "//",
            "color": "#474747",
            "strikethrough": true,
            "underline": false,
            "backgroundColor": "transparent",
            "bold": false,
            "italic": false
        },
        {
            "tag": "todo",
            "color": "#FF8C00",
            "strikethrough": false,
            "underline": false,
            "backgroundColor": "transparent",
            "bold": false,
            "italic": false
        },
        {
            "tag": "*",
            "color": "#98C379",
            "strikethrough": false,
            "underline": false,
            "backgroundColor": "transparent",
            "bold": false,
            "italic": false
        }
    ],
    "cSpell.words": [
        "backgound",
        "Casefold",
        "Casefolded",
        "Casemapped",
        "CHARACTERSTREAM",
        "CHARCLASSIFY",
        "CHARREGEX",
        "CHARSYMBOL",
        "colorstate",
        "CREATETOKEN",
        "dotenv",
        "dquote",
        "eslintcache",
        "HEXVALUE",
        "ictcp",
        "Interpunct",
        "jzazbz",
        "jzczhz",
        "Keycap",
        "letterlike",
        "lookback",
        "LPAREN",
        "noncharacter",
        "Noncharacter",
        "nonspacing",
        "Nonspacing",
        "nowatch",
        "oklab",
        "oklch",
        "retokenized",
        "RPAREN",
        "STATEPROCESS",
        "STATETOKEN",
        "statment",
        "STRINGSTATE",
        "Titlecase",
        "Titlecased",
        "TOKENMAP",
        "Uppercased"
    ],
    "editor.fontFamily": "'Hack Nerd Font', monospace",
    "editor.fontLigatures": true,
    "terminal.integrated.fontFamily": "'Hack Nerd Font'"
}




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: .vscode/settings.json ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: .gitignore ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




# dependencies (bun install)
node_modules

# output
out
dist
*.tgz

# code coverage
coverage
*.lcov

# logs
logs
_.log
report.[0-9]_.[0-9]_.[0-9]_.[0-9]_.json

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# caches
.eslintcache
.cache
*.tsbuildinfo

# IntelliJ based IDEs
.idea

# Finder (MacOS) folder config
.DS_Store

#Dictionary
cspell.json




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: .gitignore ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: git-push.sh ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




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
echo "▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄"
echo "▌                                        ▐"
echo "▌         GIT PUSH AUTOMATION            ▐"
echo "▌                                        ▐"
echo "▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀"
echo -e "${NC}\n"

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

# Display title box
echo -e "${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║     ✓ Git push process completed       ║"
echo "║            successfully!!!             ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: git-push.sh ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: package.json ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




{
  "name": "colorstate",
  "version": "1.0.0",
  "license": "MIT",
  "author": "Dustin Dew, phyxashun@gmail.com",
  "module": "index.ts",
  "devDependencies": {
    "@types/bun": "latest",
    "@types/figlet": "^1.7.0",
    "@types/node": "^25.0.3",
    "@vitest/coverage-istanbul": "4.0.16",
    "@vitest/coverage-v8": "^4.0.16",
    "@vitest/ui": "4.0.16",
    "figlet": "^1.9.4",
    "glob": "^13.0.0",
    "typedoc": "^0.28.15",
    "vitest": "^4.0.16"
  },
  "peerDependencies": {
    "typescript": "^5.9.3"
  },
  "private": true,
  "type": "module",
  "scripts": {
    "start": "bun run ./index.ts",
    "consolidate": "bun run ./Consolidate.ts",
    "test": "vitest",
    "coverage": "vitest --coverage",
    "test:nowatch": "vitest run",
    "coverage:nowatch": "vitest run --coverage",
    "git-push": "./git-push.sh 'Automated commit'"
  }
}




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: package.json ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: tsconfig.json ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




{
  "compilerOptions": {
    // Environment setup & latest features
    "lib": [
      "ESNext"
    ],
    "target": "ESNext",
    "module": "Preserve",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "allowJs": true,
    // Bundler mode
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    // Best practices
    "strict": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    // Some stricter flags (disabled by default)
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noPropertyAccessFromIndexSignature": false
  },
  "include": [
    "src/**/*.ts",
    "src/types/**/*.d.ts",
  ],
  "exclude": ["./ALL/**/*"]
}




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: tsconfig.json ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: vitest.config.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// vitest.config.ts

import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
    test: {
        reporters: ['default', 'html'],
        coverage: {
            provider: 'istanbul',
            enabled: true,
            clean: true,
            reportsDirectory: './coverage',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                '**/utils/**/*',
                'test_old/**/*',
                '0.NOTES/**/*',
                'ALL/**/*'
            ]
        },
        exclude: [
            ...configDefaults.exclude,
            '**/utils/**/*',
            'test_old/**/*',
            '.vscode/**/*',
            '0.NOTES/**/*',
            'ALL/**/*'
        ]
    }
});




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: vitest.config.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████
