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

## Getting Rid of any and unknown

```ts
function identity<T>(t: T): T {
  return t;
}


let a = identity("Hello!"); // a is string
//  ^?
let b = identity(2000);     // b is number
//  ^?
let c = identity({ a: 2 }); // c is { a: number }
//  ^?


const a1 = identity("Hello!"); // a1 is "Hello!"
//    ^?
const b1 = identity(2000);     // b1 is 2000
//    ^?
const c1 = identity({ a: 2 }); // c1 is { a: number }
//    ^?


const a2 = identity<string>("Hello!");   // a2 is string
//    ^?
const b2 = identity<number>(2000);       // b2 is number
//    ^?
const c2 = identity<{ a: 2 }>({ a: 2 }); // c2 is { a: 2 }
//    ^?

function pairs<T, U>(a: T, b: U): [T, U] {
  return [a, b];
}


const p1 = pairs(1, "1"); // [number, string]
//    ^?


function pairs2<T>(a: T, b: T): [T, T] {
  return [a, b];
}


const p2 = pairs2(1, "1");
```
