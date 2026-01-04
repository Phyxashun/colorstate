// @ts-nocheck


// ==================== Start of file: .vscode/launch.json ====================

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
// ==================== End of file: .vscode/launch.json ====================





// @ts-nocheck


// ==================== Start of file: .vscode/settings.json ====================

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
        "CHARACTERSTREAM",
        "colorstate",
        "dotenv",
        "eslintcache",
        "HEXVALUE",
        "LPAREN",
        "retokenized",
        "RPAREN",
        "STRINGSTATE"
    ]
}
// ==================== End of file: .vscode/settings.json ====================





// @ts-nocheck


// ==================== Start of file: .gitignore ====================

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
// ==================== End of file: .gitignore ====================





// @ts-nocheck


// ==================== Start of file: package.json ====================

{
  "name": "colorstate",
  "version": "1.0.0",
  "license": "MIT",
  "author": "Dustin Dew, phyxashun@gmail.com",
  "module": "index.ts",
  "devDependencies": {
    "@types/bun": "latest",
    "@types/node": "^25.0.3",
    "@vitest/coverage-istanbul": "4.0.16",
    "@vitest/coverage-v8": "^4.0.16",
    "figlet": "^1.9.4",
    "glob": "^13.0.0",
    "vitest": "^4.0.16"
  },
  "peerDependencies": {
    "typescript": "^5.9.3"
  },
  "private": true,
  "type": "module",
  "scripts": {
    "start": "bun run ./index.ts",
    "test": "vitest",
    "coverage": "vitest --coverage"
  }
}
// ==================== End of file: package.json ====================





// @ts-nocheck


// ==================== Start of file: tsconfig.json ====================

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
    "./src/**/*.ts"
  ],
  "exclude": [
    "ALL/ALL_FILES.ts",
    "ALL/ALL_TESTS.ts"
  ]
}
// ==================== End of file: tsconfig.json ====================





// @ts-nocheck


// ==================== Start of file: vitest.config.ts ====================

// vitest.config.ts

import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['**/utils/**/*.ts']
        }
    }
})
// ==================== End of file: vitest.config.ts ====================





// @ts-nocheck


// ==================== Start of file: License ====================

# MIT License

Copyright (c) 2025 Dustin Dew, [phyxashun@gmail.com]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

// ==================== End of file: License ====================





// @ts-nocheck


// ==================== Start of file: README.md ====================

# ColorState

A TypeScript-based DFA (Deterministic Finite Automaton) tokenizer for parsing text input into semantic tokens. Built with a clean state machine architecture, ColorState efficiently processes characters through state transitions to produce structured token streams.

## Features

- 🔄 **DFA State Machine**: Clean implementation using the State pattern with singleton states
- 🎯 **Dual Processing Modes**:
  - Token accumulation (multi-character tokens like "word", "123")
  - Character-by-character emission
- 🔗 **Composable Architecture**: Feed character output back into tokenizer for re-processing
- 📍 **Position Tracking**: Line, column, and index metadata for each token
- 🌐 **Unicode Support**: Full Unicode normalization (NFC) and character classification
- ⚡ **Performance Optimized**: Singleton states and efficient buffer management
- 📝 **Type-Safe**: Written in TypeScript with comprehensive type definitions

## Token Types

- **Literals**: `IDENTIFIER`, `NUMBER`, `HEXVALUE`, `STRING`, `PERCENT`
- **Operators**: `PLUS`, `MINUS`, `OPERATOR`
- **Delimiters**: `COMMA`, `SLASH`, `LPAREN`, `RPAREN`
- **Special**: `WHITESPACE`, `EOF`, `ERROR`

## Installation

### Install dependencies

```bash
bun install
```

### Add required types

```bash
bun add -d @types/node @types/bun
```

## Usage

### Basic Example

```typescript
import { Tokenizer } from './src/Tokenizer.ts';

const tokenizer = new Tokenizer();

// Tokenize a string into semantic tokens
const tokens = tokenizer.tokenizeString('rgb(255, 0, 0)');
// Returns: [IDENTIFIER, LPAREN, NUMBER, COMMA, ...]

// Extract individual characters
const chars = tokenizer.getCharacters('hello');
// Returns: [{value: 'h', ...}, {value: 'e', ...}, ...]

// Re-tokenize from characters
const retokenized = tokenizer.tokenizeCharacters(chars);
```

### With Logging (Fluent Interface)

```typescript
const tokenizer = new Tokenizer();

// Enable logging with a custom message
tokenizer
    .withLogging('Test: RGB Color')
    .tokenizeString('#ff0000 50%');

// Output:
// Test: RGB Color
// SOURCE: #ff0000 50%
// RESULT (TOKENS):
//     { value: '#ff0000', type: 'HEXVALUE' }
//     { value: ' ', type: 'WHITESPACE' }
//     { value: '50%', type: 'PERCENT' }
```

### Running the Demo

```bash
bun run index.ts
```

Or add to `package.json`:

```json
{
  "scripts": {
    "start": "bun run ./index.ts"
  }
}
```

```bash
bun start
```

## Architecture

### Core Components

- **Character**: Represents a single character with position metadata
- **CharacterStream**: Iterator for streaming characters from strings
- **CharacterArrayStream**: Iterator for streaming from character arrays
- **State**: Abstract base class for DFA states
- **Context**: Manages state transitions and token emission
- **Tokenizer**: High-level API for tokenization

### State Machine

The tokenizer uses a DFA with the following states:

- `InitialState`: Non-accepting routing state
- `WhitespaceState`: Accumulates whitespace
- `LetterState`: Accumulates identifiers
- `NumberState`: Accumulates numbers
- `HexState`: Handles hex color codes (#RGB)
- `PercentState`: Handles percentage values
- `OperatorState`: Processes operators
- `EndState`: Terminal EOF state

## Testing

### Setup Testing Framework

```bash
bun add -d vitest
```

Choose coverage provider:

### **V8 Coverage (recommended)**

```bash
bun add -d @vitest/coverage-v8
```

### **Istanbul Coverage**

```bash
bun add -d @vitest/coverage-istanbul
```

### Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.ts',
        'tests/**/*.test.ts'
      ]
    }
  }
})
```

### Update package.json

```json
{
  "scripts": {
    "start": "bun run ./index.ts",
    "test": "vitest",
    "test:run": "vitest run",
    "coverage": "vitest --coverage"
  }
}
```

### Running Tests

### **Run once (no watch)**

```bash
bun test:run
```

### **Run with watch mode**

```bash
bun test
```

### **Run with coverage**

```bash
bun coverage
```

### Coverage Exclusions

#### V8 Coverage Pragmas

### **Ignore if/else branches**

```typescript
/* v8 ignore if -- @preserve */
if (parameter) { 
  console.log('Ignored') 
} else {
  console.log('Included')
}
```

### **Ignore next statement**

```typescript
/* v8 ignore next -- @preserve */
console.log('Ignored')
console.log('Included')
```

### **Ignore entire function**

```typescript
/* v8 ignore next -- @preserve */
function ignored() { 
  console.log('All lines ignored')
}
```

### **Ignore class**

```typescript
/* v8 ignore next -- @preserve */
class Ignored { 
  ignored() {}
  alsoIgnored() {}
}
```

### **Ignore try/catch**

```typescript
/* v8 ignore next -- @preserve */
try { 
  console.log('Ignored') 
} catch (error) { 
  console.log('Ignored') 
}
```

### **Ignore switch cases**

```typescript
switch (type) {
  case 1:
    return 'Included'
  /* v8 ignore next -- @preserve */
  case 2: 
    return 'Ignored'
  /* v8 ignore next -- @preserve */
  default: 
    return 'Ignored'
}
```

### **Ignore entire file**

```typescript
/* v8 ignore file -- @preserve */
export function ignored() { 
  return 'Whole file is ignored'
}
```

#### Istanbul Coverage Pragmas

Replace `v8` with `istanbul` in any of the above examples:

```typescript
/* istanbul ignore next -- @preserve */
/* istanbul ignore if -- @preserve */
/* istanbul ignore file -- @preserve */
```

## Project Structure

```bash
colorstate/
├── src/
│   ├── Character.ts      # Character types and streams
│   ├── Context.ts        # DFA context and processing logic
│   ├── States.ts         # State machine implementations
│   └── Tokenizer.ts      # High-level tokenizer API
├── tests/
│   └── *.test.ts         # Test files
├── index.ts              # Demo/example usage
├── vitest.config.ts      # Test configuration
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please ensure:

- All tests pass (`bun test:run`)
- Code coverage remains high (`bun coverage`)
- TypeScript types are properly defined
- JSDoc comments are added for public APIs

## License

MIT

## About

This project was created using `bun init` in bun v1.3.4. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

Built as an educational project to demonstrate DFA tokenization, state machine design patterns, and TypeScript best practices.

// ==================== End of file: README.md ====================





