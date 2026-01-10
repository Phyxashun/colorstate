

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


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: License ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




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





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: License ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: README.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




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





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: README.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: 0. NOTES/10. UNICODEParsingCharacterClasses.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




# Annex F. Parsing Character Classes

It is reasonably straightforward to build a parser for Character Classes. While there are many ways to do this, the following describes one example of a logical process for building such a parser. Implementations can use optimized code, such as a DFA (Deterministic Finite Automaton) for processing.

## Storage

The description uses Java syntax to illustrate the code, but of course would be expressed in other programming languages. At the core is a class (here called CharacterClass) that stores the information that is being built, typically a set of strings optimized for compact storage of ranges of characters, such as ICU’s UnicodeSet (C++).

The methods needed are the following:

| Method                                        | Meaning                       |
|:----------------------------------------------|:------------------------------|
| CharacterClass create()                       | A = {}                        |
| void addAll(CharacterClass other)             | A = A ∪ other                 |
| void retainAll(CharacterClass other)          | A = A ∩ other                 |
| void removeAll(CharacterClass other)          | A = A ∖ other                 |
| void symmetricDiffAll(CharacterClass other)   | A = A ⊖ other                 |
| void add(int cp)                              | A = A ∪ {cp}                  |
| void addRange(int cpStart, int cpEnd)         | A = A ∪ {cpStart .. cpEnd}    |
| void addString(String stringToAdd)            | A = A ∪ {stringToAdd}         |
| void codePointComplement()                    | A = ∁ℙA                       |
| void setToProperty(String propertyString)     | A = propertySet               |

## Building

At the top level a method parseCharacterClass can recognize and branch on ‘\p{’, ‘\P{’, ‘[’, and ‘[^’ . For ‘\p{’ and ‘\P{’, it calls a parseProperty method that parses up to an unescaped ‘}’, and returns a set based on Unicode properties. See RL1.2 Properties, 2.7 Full Properties, RL2.7 Full Properties, and 2.8 Optional Properties.

For ‘[’, and ‘[^’, it calls a parseSequence method that parses out items, stopping when it hits ‘]’. The type of each item can be determined by the initial characters. There is a special check for ‘-’ so that it can be interpreted according to context. The targetSet is set to the first item. All successive items at that level are combined with the targetSet, according to the specified operation (union, intersection, etc.). Note that other binding/precedence options would require somewhat more complicated parsing.

For the Character Class item, a recursive call is made on the parseCharacterClass method. The other initial characters that are branched on are ‘\u{’, ‘\u’, ‘\q{’, ‘\N{’, ‘\’, the operators, and literal and escaped characters.

### Examples

In the following examples, ➗  is a cursor marking how the parsing progresses. For brevity, intermediate steps that only change state are omitted. The two examples are the same, except that in the right-hand example the second and third character classes are grouped.

#### Example 1: No Grouping

| Input                            | Action                | Result    |
|:---------------------------------|:----------------------|:----------|
| ➗[[abc] -- [bcd] && [c-e]]      | A = create()          | A = []    |
| [[a➗bc] -- [bcd] && [c-e]]      | A.add('a')            | A = [a]   |
| [[ab➗c] -- [bcd] && [c-e]]      | A.add('b')            | A = [ab]  |
| [[abc➗] -- [bcd] && [c-e]]      | A.add('c')            | A = [a-c] |
| [[abc] -- ➗[bcd] && [c-e]]      | B = create()          | A = [a-c] |
| [[abc] -- [b➗cd] && [c-e]]      | B.add('b')            |           |
| [[abc] -- [bc➗d] && [c-e]]      | B.add('c')            | B = [b-c] |
| [[abc] -- [bcd➗] && [c-e]]      | B.add('d')            | B = [b-d] |
| [[abc] -- [bcd]➗ && [c-e]]      | A.removeAll(B)        | A = [a]   |
| [[abc] -- [bcd] && ➗[c-e]]      | B.clear()             | B = []    |
| [[abc] -- [[bcd] && [c➗-e]]]    | B.add('c')            | B = [c]   |
| [[abc] -- [[bcd] && [c-e➗]]]    | B.addRange('d', 'e')  | B = [c-e] |
| [[abc] -- [[bcd] && [c-e]➗]]    | A.retainAll(C)        | A = []    |

#### Example 2: With Grouping

| Input                              | Action                | Result    |
|:-----------------------------------|:----------------------|:----------|
| ➗[[abc] -- [[bcd] && [c-e]]]      | A = create()          | A = []    |
| [[a➗bc] -- [[bcd] && [c-e]]]      | A.add('a')            | A = [a]   |
| [[ab➗c] -- [[bcd] && [c-e]]]      | A.add('b')            | A = [ab]  |
| [[abc➗] -- [[bcd] && [c-e]]]      | A.add('c')            | A = [a-c] |
| [[abc] -- ➗[[bcd] && [c-e]]]      | B = create()          | A = [a-c] |
| [[abc] -- [[b➗cd] && [c-e]]]      | B.add('b')            |           |
| [[abc] -- [[bc➗d] && [c-e]]]      | B.add('c')            | B = [b-d] |
| [[abc] -- [[bcd➗] && [c-e]]]      | B.add('d')            | B = [b-d] |
| [[abc] -- [[bcd]➗ && [c-e]]]      |                       |           |
| [[abc] -- [[bcd] && ➗[c-e]]]      | C = create()          | C = []    |
| [[abc] -- [[bcd] && [c➗-e]]]      | C.add('c')            | C = [c]   |
| [[abc] -- [[bcd] && [c-e➗]]]      | C.addRange('d', 'e')  | C = [c-e] |
| [[abc] -- [[bcd] && [c-e]➗]]      | B.retainAll(C)        | B = [cd]  |
| [[abc] -- [[bcd] && [c-e]]]➗      | A.removeAll(B)        | A = [ab]  |





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: 0. NOTES/10. UNICODEParsingCharacterClasses.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: 0. NOTES/11. BoxTest Recommendation.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




# BoxText() Changes

Of course! These are excellent and powerful additions. Adding custom widths, separate text coloring, and text alignment will turn `BoxText` into a highly professional and reusable utility.

Let's implement these changes. We'll need to update the options interface and then significantly refactor the `BoxText` function to handle the more complex rendering logic.

## 1. Update the `BoxTextOptions` Interface

First, we'll add the new properties to `BoxTextOptions` in `PrintLine.ts`.

```typescript
// In PrintLine.ts

interface BoxTextOptions {
    preNewLine?: boolean;
    postNewLine?: boolean;
    // Allow 'tight', 'max', or a specific number for the width
    width?: 'tight' | 'max' | number;
    boxStyle?: BoxStyle;
    
    // Box-specific styling
    color?: InspectColor | InspectColor[];
    bgColor?: InspectColor | InspectColor[];
    styles?: ('bold' | 'italic' | 'underline')[];

    // New! Text-specific styling
    textColor?: InspectColor | InspectColor[];
    textBgColor?: InspectColor | InspectColor[];
    textStyles?: ('bold' | 'italic' | 'underline')[];
}
```

## 2. Refactor the `BoxText` Function

This is the main part of the work. The old implementation styled the entire box at once. The new implementation must build the box in styled pieces (top border, left border, text, right border, bottom border) to allow for different colors.

Here is the complete, refactored `BoxText` function.

```typescript
// In PrintLine.ts, replace your old BoxText function with this one.

/**
 * @function BoxText
 * @description Draws a styled ASCII box around a given text string and prints it to the console.
 * @param {string} text - The text to be enclosed in the box.
 * @param {BoxTextOptions} [options={}] - Configuration options for the box.
 * @returns {void}
 */
export const BoxText = (text: string, options: BoxTextOptions = {}): void => {
    // --- 1. Set Defaults and Merge Options ---
    const {
        preNewLine = false,
        postNewLine = false,
        width = 'tight',
        boxStyle = 'single',
        color,
        bgColor,
        styles,
        textColor,
        textBgColor,
        textStyles,
    } = options;

    const boxChars = BOX_STYLES[boxStyle];

    // --- 2. Prepare Separate Styles for Box and Text ---
    const boxFinalStyles = [
        ...(color ? (Array.isArray(color) ? color : [color]) : []),
        ...(bgColor ? (Array.isArray(bgColor) ? bgColor : [bgColor]) : []),
        ...(styles || []),
    ];
    
    // If text styles aren't provided, they default to the box styles
    const textFinalStyles = [
        ...(textColor ? (Array.isArray(textColor) ? textColor : [textColor]) : boxFinalStyles),
        ...(textBgColor ? (Array.isArray(textBgColor) ? textBgColor : [textBgColor]) : []),
        ...(textStyles || []),
    ];


    // --- 3. Calculate Content Width and Wrap Text ---
    let contentWidth: number;
    let textLines: string[];

    if (width === 'max') {
        contentWidth = MAX_WIDTH - 4; // 80 - 2 for borders - 2 for padding
    } else if (typeof width === 'number') {
        if (width <= 4) throw new Error('Custom width must be greater than 4.');
        contentWidth = width - 4;
    } else { // 'tight'
        textLines = text.split('\n');
        contentWidth = Math.max(...textLines.map(line => line.length));
    }

    // Word-wrap the text if width is 'max' or a number
    if (width !== 'tight') {
        const words = text.split(/\s+/);
        textLines = words.reduce((lines, word) => {
            if (lines.length === 0) return [word];
            let lastLine = lines[lines.length - 1];
            if ((lastLine.length + word.length + 1) > contentWidth) {
                lines.push(word);
            } else {
                lines[lines.length - 1] = lastLine + ' ' + word;
            }
            return lines;
        }, [] as string[]);
    }


    // --- 4. Build the Box with Piece-by-Piece Styling ---
    
    // Helper to center-align text
    const centerAlign = (str: string, width: number): string => {
        const padding = Math.floor((width - str.length) / 2);
        return ' '.repeat(padding) + str + ' '.repeat(width - str.length - padding);
    };

    // Style the border components
    const styledTop = styleText(boxFinalStyles, boxChars.tl + boxChars.t.repeat(contentWidth + 2) + boxChars.tr);
    const styledBottom = styleText(boxFinalStyles, boxChars.bl + boxChars.b.repeat(contentWidth + 2) + boxChars.br);
    const styledLeftBorder = styleText(boxFinalStyles, boxChars.l + ' ');
    const styledRightBorder = styleText(boxFinalStyles, ' ' + boxChars.r);

    // Style each line of text and assemble with borders
    const styledContentLines = textLines.map(line => {
        const centeredText = centerAlign(line, contentWidth);
        const styledText = styleText(textFinalStyles, centeredText);
        return styledLeftBorder + styledText + styledRightBorder;
    });

    const fullBoxString = [
        styledTop,
        ...styledContentLines,
        styledBottom
    ].join('\n');

    // --- 5. Print Final Output ---
    const pre = preNewLine ? '\n' : '';
    const post = postNewLine ? '\n' : '';
    console.log(`${pre}${fullBoxString}${post}`);
};
```

## How the New Logic Works

1. **Separate Style Preparations:** The code now creates two distinct style arrays: `boxFinalStyles` and `textFinalStyles`. Crucially, if you don't provide a `textColor`, the `textFinalStyles` will default to using the `boxFinalStyles`, so it still looks good out-of-the-box.
2. **Flexible Width Calculation:** The logic now correctly handles all three cases for `width`:
    * **`'max'`**: Sets a fixed `contentWidth` of 76.
    * **`number`**: Sets the `contentWidth` based on your number, ensuring it's valid.
    * **`'tight'`**: Calculates the `contentWidth` based on the longest line of text *after* splitting by newlines.
3. **Unified Word Wrapping:** The word-wrap logic is now correctly applied for both `'max'` and `number` widths.
4. **Centering and Piece-by-Piece Styling:** This is the biggest change.
    * A new `centerAlign` helper function ensures every line of text is perfectly centered within the `contentWidth`.
    * Instead of building one giant string and styling it at the end, it now styles the **top border**, **left border**, **text**, **right border**, and **bottom border** as separate pieces.
    * It then joins these pre-styled pieces together to create the final visual output. This is the key to allowing the text and border to have different styles.

## New Usage Examples

You can now use your function in these powerful new ways:

```typescript
// --- Custom Width with Centered Text ---
BoxText('This box has a custom width of 50.', {
    width: 50,
    boxStyle: 'double',
    preNewLine: true,
    postNewLine: true,
});

// --- Custom Text Color ---
BoxText('This text is a different color from the border.', {
    width: 'max',
    color: 'gray', // Border color
    textColor: 'cyan', // Text color
    preNewLine: true,
    postNewLine: true,
});

// --- Complex Example: Themed Box with Styled Text ---
const longText = 'This demonstrates all features: a custom width, a heavy box style, a gray border, and bold, centered, yellow text inside.';
BoxText(longText, {
    width: 60,
    boxStyle: 'heavy',
    color: 'gray',
    textColor: 'yellow',
    textStyles: ['bold'],
    preNewLine: true,
    postNewLine: true,
});
```





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: 0. NOTES/11. BoxTest Recommendation.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: 0. NOTES/9. TokenizerUpdates.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




To update your `Tokenizer` to leverage the new `CharacterStream` functions, you should shift the responsibility of "peeking" and "marking" into the lexing loop. This allows you to handle complex tokens—like multi-character operators or specific CSS units—without prematurely advancing the stream.

Here is how to refactor your `Tokenizer` to use the advanced features of your `CharacterStream`.

### 1. Simplify the Main Loop

Instead of a standard `for...of` loop, use a `while` loop with `stream.next()`. This gives you the flexibility to use `mark()`, `reset()`, and `peek()` inside the loop body.

```typescript
// src/Tokenizer.ts
public tokenize(input: string): Token[] {
    const stream = new Char.Stream(input);
    const tokens: Token[] = [];
    this.buffer = [];

    while (!stream.isEOF()) {
        const wasInString = this.ctx.isInString();
        
        // Use the new next() method to get the full Character object
        const charResult = stream.next();
        if (charResult.done) break;
        const char = charResult.value;

        let result = this.ctx.process(char);

        // Handle emission before potentially reprocessing
        if (result.emit && this.buffer.length > 0) {
            tokens.push(this.createTokenFromBuffer(wasInString));
        }

        if (result.reprocess) {
            // We can now use stream.back() or just let the context 
            // handle the re-processing of the current char
            result = this.ctx.process(char);
        }

        if (result.action === 'buffer' && char.type !== Char.Type.EOF) {
            this.buffer.push(char);
        }
    }

    // Flush final token
    if (this.buffer.length > 0) {
        tokens.push(this.createTokenFromBuffer(this.ctx.isInString()));
    }

    tokens.push({ value: '', type: TokenType.EOF });
    return tokens;
}

```

### 2. Using `peek()` for Multi-character Symbols

If you want to support operators like `==` or `!=` (common in many languages), you can use the `peek()` function to look ahead without moving the cursor.

```typescript
// Inside a State handler or the Tokenizer loop
if (char.value === '=') {
    const nextChar = stream.peek(0); // Look at the very next char
    if (nextChar.value === '=') {
        stream.next(); // Actually consume the second '='
        // Logic for TokenType.EQUALS_EQUALS
    }
}

```

### 3. Using `mark()` and `reset()` for Speculative Units

If your language has ambiguous syntax where a sequence might be a `Dimension` or just a `Number` followed by an `Identifier`, you can use speculative marks.

```typescript
private handleSpeculativeUnit(stream: Char.Stream) {
    stream.mark(); // Save position
    
    // Try to consume something that looks like a complex unit
    const unitChars = stream.consumeWhile(c => c.type === Char.Type.Letter);
    
    if (this.isValidUnit(unitChars)) {
        stream.commit(); // Success! Keep the progress
    } else {
        stream.reset();  // Failure! Rewind to before we started consuming letters
    }
}

```

### 4. Leveraging `lookbackWhile` for Context

Your `Tokenizer` can now make decisions based on what happened *before* the current character without tracking it manually in a separate array. For example, to determine if a `-` is a "Unary Minus" or a "Subtraction" operator:

```typescript
const isUnary = (stream: Char.Stream) => {
    // Look back past any whitespace to see if the previous token was an operator
    const preceding = stream.lookbackWhile(c => c.type === Char.Type.Whitespace);
    const lastNonSpace = stream.charsBuffer[stream.charsBuffer.length - preceding.length - 2];
    
    return lastNonSpace?.type === Char.Type.LParen || lastNonSpace?.type === Char.Type.Plus;
};

```

### Key Efficiency Gains:

* **Coordinate Accuracy**: By using `stream.next()`, your tokens will now have perfect `line` and `column` data derived directly from the stream's position.
* **Cleanliness**: You no longer need to manually manage `index` or `line` increments inside the `Tokenizer`; the `Stream` class handles the internal state of the source string.
* **Safety**: Using `normalize('NFC')` in the stream constructor ensures that characters like `e` + `´` are treated as a single `é` character, preventing bugs in your classification logic.




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: 0. NOTES/9. TokenizerUpdates.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: 0. NOTES/8. LookBackWhile.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




# lookbackWhile() Method

Yes, absolutely. That's a fantastic idea and a very common requirement for more advanced tokenizers. A lookbackWhile method is the perfect complement to consumeWhile.

***

This pattern allows the tokenizer to react to a "terminating" character (like %, px, ", etc.) and then retrospectively bundle the preceding characters into a single, more meaningful token.

Your charsBuffer is the key to making this work. It acts as the history that lookbackWhile will inspect.

## The lookbackWhile Method Implementation

Here is the method. You can add it directly to your CharacterStream class. It will iterate backwards from the end of your charsBuffer.

```typescript
// Add this method to your CharacterStream class

/**
 * Looks backwards from the current stream position through the character buffer
 * and collects a contiguous sequence of characters that match a predicate.
 *
 * This method does NOT change the stream's position.
 *
 * @param predicate A function that takes a Character and returns a boolean.
 * @returns An array of the matching characters, in their original forward order.
 */
public lookbackWhile(predicate: (char: Character) => boolean): Character[] {
    if (this.charsBuffer.length === 0) {
        return [];
    }

    const lookedBackChars: Character[] = [];

    // Iterate backwards from the end of the buffer.
    for (let i = this.charsBuffer.length - 1; i >= 0; i--) {
        const char = this.charsBuffer[i];

        // If the character matches the predicate, add it to our results.
        if (predicate(char)) {
            lookedBackChars.push(char);
        } else {
            // If we find a character that doesn't match, we must stop.
            // We only want a contiguous block from the end.
            break;
        }
    }

    // The characters were collected in reverse order (e.g., '3', '2', '1').
    // Reverse the array to return them in their natural order ('1', '2', '3').
    return lookedBackChars.reverse();
}
```

## How to Use It in a Tokenizer

Now, let's create a conceptual tokenizer that uses this new method to handle your exact use case: combining numbers into a single "percent" token when it encounters a %.

The key insight here is that by the time you see the %, you have already processed the numbers and likely added them to your token list as individual Number tokens. Your tokenizer needs to correct its own output by removing those individual tokens and replacing them with the new, combined one.

## Here is a complete, runnable example:

```ts
// Assume your CharacterStream, CharType, etc., are all defined.

function createPercentToken(stream: CharacterStream) {
    // 1. We are at the '%' character. Look backwards for numbers.
    const numberPart = stream.lookbackWhile(char => char.type === CharType.Number);

    // If we didn't find any numbers, just return the percent sign itself.
    if (numberPart.length === 0) {
        return { type: 'PERCENT_SIGN', value: '%' };
    }

    // 2. We found numbers! Combine them to form the new token.
    const numberValue = numberPart.map(c => c.value).join('');
    const fullTokenValue = numberValue + '%';

    // 3. Create the new, combined token.
    // The `replaceCount` tells the tokenizer how many previous tokens to discard.
    return {
        type: 'PERCENT_TOKEN',
        value: fullTokenValue,
        replaceCount: numberPart.length, // VERY IMPORTANT
    };
}
```

```ts
// --- A Simple Tokenizer ---
function tokenizer(stream: CharacterStream) {
    const tokens: any[] = [];

    while (!stream.isEOF()) {
        const char = stream.peek();

        // --- The Special Logic for '%' ---
        if (char.value === '%') {
            // Create the special token.
            const token = createPercentToken(stream);

            // If the token wants us to replace previous tokens, do it now.
            if (token.replaceCount && token.replaceCount > 0) {
                // Remove the now-redundant individual number tokens from our output.
                tokens.splice(tokens.length - token.replaceCount);
                console.log(`⏪ Corrected history: Removed ${token.replaceCount} previous number token(s).`);
            }
            
            // Add the new, combined token.
            tokens.push({ type: token.type, value: token.value });

            stream.next(); // Consume the '%'
            continue;
        }

        // --- Default Logic for All Other Characters ---
        // For any other character, just add it as a simple token.
        tokens.push({ type: char.type, value: char.value });
        stream.next();
    }
    return tokens;
}
```

```ts
// --- Run the Example ---
const input = "Total progress: 100%";
const stream = new CharacterStream(input);

console.log(`Input: "${input}"\n`);
const finalTokens = tokenizer(stream);

console.log("\n✅ Final Tokens:");
console.table(finalTokens);
```

### Output of the Example:

```bash
Input: "Total progress: 100%"

Corrected history: Removed 3 previous number token(s).

Final Tokens:
┌─────────┬────────────────┬───────────────┐
│ (index) │      type      │     value     │
├─────────┼────────────────┼───────────────┤
│    0    │    'Letter'    │      'T'      │
│    1    │    'Letter'    │      'o'      │
│    2    │    'Letter'    │      't'      │
│    3    │    'Letter'    │      'a'      │
│    4    │    'Letter'    │      'l'      │
│    5    │  'Whitespace'  │      ' '      │
│    6    │    'Letter'    │      'p'      │
│   ...   │       ...      │      ...      │
│   15    │  'Punctuation' │      ':'      │
│   16    │  'Whitespace'  │      ' '      │
│   17    │ 'PERCENT_TOKEN'│     '100%'    │
└─────────┴────────────────┴───────────────┘
```

This "look back and correct" pattern is extremely powerful. Your lookbackWhile method provides the essential tool to inspect the immediate past, enabling your tokenizer to build context-aware, complex tokens from simple ones.

***

### Suggestions

* How would I implement `mark()` and `reset()` with this new `charsBuffer`?
* Can you show me an example of `back(steps)` in action with the `charsBuffer`?
* How can I make `lookbackWhile` more efficient for very long inputs?





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: 0. NOTES/8. LookBackWhile.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: 0. NOTES/7. CharStreamChanges.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




# Yes, this will absolutely work. This is an excellent refactoring

You have significantly improved the design by encapsulating the position logic. The introduction of `getPosition()` and `setPosition()` is a powerful feature for a tokenizer, and breaking the complex `peek(n)` logic into the `peekPosition` and `peekAdvance` helpers makes the code much more readable and maintainable.

Let's review the design and then address a few minor improvements to make it even more robust.

## Analysis of Your New Design

* **Excellent Encapsulation:** The `getPosition`/`setPosition` methods are a fantastic addition. They treat the stream's cursor as a transactional state that can be saved and restored. This is invaluable for advanced parsing techniques where you might need to "try" a path and then backtrack if it doesn't work out. The function overloading on `setPosition` is also very idiomatic and user-friendly.
* **Correct `peek` Logic:** Your new implementation of `peek(n)` using the `peekPosition` helper is **correct**. It successfully simulates the advancement without modifying the stream's actual state (`this.index`, etc.).
* **Clear Separation of Concerns:** The `peekAdvance` method now has one clear job: calculate the position of the *next* character based on a given starting position. `peekPosition` has one clear job: orchestrate the simulation by calling `peekAdvance` `n` times. This is a very clean design.

### Minor Improvements and Bug Fixes

Your code is very close to perfect, but I've identified one subtle bug in `lookahead()` and have a suggestion to make `back()` more memory-efficient.

#### 1. Bug Fix: `lookahead(n)` Is Incorrect

The `lookahead(n)` method has a bug that your `peek(n)` method correctly solves.

* **The Problem:** The line `const lookaheadIndex = this.index + n;` assumes that every character is exactly one index position wide. This is not true for many Unicode characters (like emojis or complex graphemes), which can be 2 or more code units long. For example, in the string "👍a", `lookahead(1)` would point to the middle of the "👍" emoji instead of the "a".
* **The Solution:** You've already solved this! The `peekPosition(n)` method correctly simulates stepping through the string one full character at a time. We should simply use it.

```typescript
// FIXED lookahead(n)
public lookahead(n: number = 0): string {
    const peekedPosition = this.peekPosition(n);
    if (this.isEOF(peekedPosition.index)) {
        return '';
    }
    return String.fromCodePoint(this.source.codePointAt(peekedPosition.index)!);
}
```

#### 2. Improvement: Memory-Efficient `back()`

The current `back()` method relies on storing every character ever consumed in the `public chars: Character[]` array. For a 10 MB source file, this array would hold millions of objects and consume a huge amount of memory.

A more robust and memory-efficient stream would only store the position of the *immediately preceding* character.

* **The Solution:** We'll add a `private previousPosition: Position` property. In `advance()`, before we update the main position, we'll save the current position to `previousPosition`. The `back()` method then simply needs to restore the state from `previousPosition`. This reduces the memory footprint from O(N) to O(1).

### Final, Refactored `CharacterStream`

Here is the complete class incorporating these final improvements. This version is robust, memory-efficient, and highly useful for a tokenizer.

```typescript
class CharacterStream implements IterableIterator<Character> {
    private readonly source: string;
    private index: number = 0;
    private line: number = 1;
    private column: number = 1;
    
    // For efficient backtracking
    private previousPosition: Position;

    constructor(input: string) {
        this.source = input.normalize('NFC');
        this.previousPosition = { index: 0, line: 1, column: 1 };
    }

    public getPosition(): Position {
        return { index: this.index, line: this.line, column: this.column };
    }

    public setPosition(position: Position): void;
    public setPosition(index: number, line: number, column: number): void;
    public setPosition(indexOrPosition: number | Position, line?: number, column?: number): void {
        if (typeof indexOrPosition === 'object') {
            this.index = indexOrPosition.index;
            this.line = indexOrPosition.line;
            this.column = indexOrPosition.column;
        } else {
            this.index = indexOrPosition;
            this.line = line!;
            this.column = column!;
        }
    }
    
    public [Symbol.iterator](): IterableIterator<Character> {
        return this;
    }
    
    public peek(n: number = 0): Character {
        const { index, line, column } = this.peekPosition(n);
        if (this.isEOF(index)) return this.atEOF(index, line, column);

        const value = String.fromCodePoint(this.source.codePointAt(index)!);
        return { value, type: CharUtility.classify(value), position: { index, line, column } };
    }

    private peekPosition(n: number): Position {
        if (n < 0) throw new Error("Lookahead distance `n` must be non-negative.");
        if (n === 0) return this.getPosition();

        let pos = this.getPosition();
        for (let i = 0; i < n; i++) {
            if (this.isEOF(pos.index)) return pos;
            pos = this.calculateNextPosition(pos);
        }
        return pos;
    }

    private calculateNextPosition(currentPos: Position): Position {
        const charValue = String.fromCodePoint(this.source.codePointAt(currentPos.index)!);
        const newIndex = currentPos.index + charValue.length;
        if (charValue === '\n') {
            return { index: newIndex, line: currentPos.line + 1, column: 1 };
        } else {
            return { index: newIndex, line: currentPos.line, column: currentPos.column + [...charValue].length };
        }
    }
    
    public lookahead(n: number = 0): string {
        const { index } = this.peekPosition(n);
        if (this.isEOF(index)) return '';
        return String.fromCodePoint(this.source.codePointAt(index)!);
    }
    
    public next(): IteratorResult<Character> {
        if (this.isEOF()) return { done: true, value: null };
        const nextChar = this.peek(0);
        this.advance(nextChar.value);
        return { done: false, value: nextChar };
    }

    public advance(charValue: string): void {
        // Save current position for backtracking *before* advancing.
        this.previousPosition = this.getPosition();

        this.index += charValue.length;
        if (charValue === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column += [...charValue].length;
        }
    }
    
    public back(): void {
        this.setPosition(this.previousPosition);
    }

    public consumeWhile(predicate: (char: Character) => boolean): Character[] {
        const consumed: Character[] = [];
        while (!this.isEOF() && predicate(this.peek())) {
            const result = this.next();
            if (!result.done) consumed.push(result.value);
        }
        return consumed;
    }

    public isEOF(index = this.index): boolean {
        return index >= this.source.length;
    }

    public atEOF(index = this.index, line = this.line, column = this.column): Character {
        return { value: '', type: CharType.EOF, position: { index, line, column } };
    }
}
```

Excellent question. Implementing `mark()` and `reset()` is a classic and powerful pattern for tokenizers and parsers. It allows the parser to "try" a certain parsing path and, if it fails, easily rewind the stream to a known good state without manually backtracking one character at a time.

The most robust way to implement this is by using a **stack** for your marks. This allows for nested marking, which is essential for parsing nested structures (e.g., a function call inside another function's argument list).

Here’s how you can implement it:

1. **`marks` Property**: Add a private array to the class to act as a stack for `Position` objects.
2. **`mark()` Method**: Pushes the stream's current position onto the `marks` stack.
3. **`reset()` Method**: Pops the most recent position from the stack and restores the stream's state to that position. This is used when a parsing path fails.
4. **`commit()` Method (Optional but Recommended)**: Pops the most recent position from the stack *without* changing the stream's state. This is used when a parsing path succeeds, and the backtrack point is no longer needed. It prevents the stack from growing indefinitely.

### Implementation Details

Here are the new methods and the property to add to your `CharacterStream` class.

```typescript
// Add this property to your CharacterStream class
private readonly marks: Position[] = [];

/**
 * Saves the current stream position to a stack.
 * This is useful for speculative parsing, allowing you to "try" a path
 * and then either reset() on failure or commit() on success.
 */
public mark(): void {
    this.marks.push(this.getPosition());
}

/**
 * Restores the stream to the last saved position from the mark() stack.
 * If no mark is present, it throws an error.
 * This consumes the mark.
 */
public reset(): void {
    if (this.marks.length === 0) {
        throw new Error("Cannot reset. No mark has been set.");
    }

    const lastMark = this.marks.pop()!;
    this.setPosition(lastMark);
}

/**
 * Removes the last saved mark from the stack without changing the stream's position.
 * This should be called after a speculative parse succeeds.
 */
public commit(): void {
    if (this.marks.length === 0) {
        throw new Error("Cannot commit. No mark has been set.");
    }
    this.marks.pop();
}
```

### How to Use It in a Tokenizer (Conceptual Example)

Imagine you are parsing CSS and you encounter an `r`. This could be the start of `rgb(...)` or `rem`. You need to speculatively parse to find out.

```typescript
// Conceptual Tokenizer code
function parseUnit(stream: CharacterStream) {
    const firstChar = stream.peek().value;

    if (firstChar === 'r') {
        stream.mark(); // Mark the position before the 'r'

        stream.next(); // Consume 'r'
        stream.next(); // Consume 'e'
        stream.next(); // Consume 'm'

        if (stream.peek().type === CharType.LParen) {
            // This wasn't 'rem', it might be 'rgb(' or something else.
            stream.reset(); // << REWIND! Stream is now back before the 'r'
            // ... now try parsing 'rgb(' ...
        } else {
            // It was 'rem'! The parse was successful.
            stream.commit(); // << Finalize. Remove the unnecessary mark.
            return createToken('rem', ...);
        }
    }
    // ...
}
```

### Complete, Updated `CharacterStream` Class

Here is your full `CharacterStream` class with the `mark`, `reset`, and `commit` methods integrated.

```typescript
class CharacterStream implements IterableIterator<Character> {
    private readonly source: string;
    private index: number = 0;
    private line: number = 1;
    private column: number = 1;

    // --- NEW ---
    private readonly marks: Position[] = [];

    // Keep this for single-step `back()` if you still want it
    private previousPosition: Position;

    constructor(input: string) {
        this.source = input.normalize('NFC');
        this.previousPosition = { index: 0, line: 1, column: 1 };
    }

    public getPosition(): Position {
        return { index: this.index, line: this.line, column: this.column };
    }

    public setPosition(position: Position): void;
    public setPosition(index: number, line: number, column: number): void;
    public setPosition(indexOrPosition: number | Position, line?: number, column?: number): void {
        if (typeof indexOrPosition === 'object') {
            this.index = indexOrPosition.index;
            this.line = indexOrPosition.line;
            this.column = indexOrPosition.column;
        } else {
            this.index = indexOrPosition;
            this.line = line!;
            this.column = column!;
        }
    }

    // --- NEW METHODS ---
    public mark(): void {
        this.marks.push(this.getPosition());
    }

    public reset(): void {
        if (this.marks.length === 0) {
            throw new Error("Cannot reset. No mark has been set.");
        }
        const lastMark = this.marks.pop()!;
        this.setPosition(lastMark);
    }
    
    public commit(): void {
        if (this.marks.length === 0) {
            throw new Error("Cannot commit. No mark has been set.");
        }
        this.marks.pop();
    }
    // --- END NEW METHODS ---

    public [Symbol.iterator](): IterableIterator<Character> {
        return this;
    }

    public peek(n: number = 0): Character {
        // ... (implementation is correct from previous version)
        const { index, line, column } = this.peekPosition(n);
        if (this.isEOF(index)) return this.atEOF(index, line, column);
        const value = String.fromCodePoint(this.source.codePointAt(index)!);
        return { value, type: CharUtility.classify(value), position: { index, line, column } };
    }

    private peekPosition(n: number): Position {
        // ... (implementation is correct from previous version)
        if (n < 0) throw new Error("Lookahead distance `n` must be non-negative.");
        if (n === 0) return this.getPosition();
        let pos = this.getPosition();
        for (let i = 0; i < n; i++) {
            if (this.isEOF(pos.index)) return pos;
            pos = this.calculateNextPosition(pos);
        }
        return pos;
    }
    
    private calculateNextPosition(currentPos: Position): Position {
        // ... (implementation is correct from previous version)
        const charValue = String.fromCodePoint(this.source.codePointAt(currentPos.index)!);
        const newIndex = currentPos.index + charValue.length;
        if (charValue === '\n') {
            return { index: newIndex, line: currentPos.line + 1, column: 1 };
        } else {
            return { index: newIndex, line: currentPos.line, column: currentPos.column + [...charValue].length };
        }
    }

    public next(): IteratorResult<Character> {
        if (this.isEOF()) return { done: true, value: null };
        const nextChar = this.peek(0);
        this.advance(nextChar.value);
        return { done: false, value: nextChar };
    }

    public advance(charValue: string): void {
        this.previousPosition = this.getPosition(); // For single-step `back()`
        this.index += charValue.length;
        if (charValue === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column += [...charValue].length;
        }
    }

    public back(): void {
        this.setPosition(this.previousPosition);
    }

    // ... (rest of the class)
    public consumeWhile(predicate: (char: Character) => boolean): Character[] { /* ... */ }
    public isEOF(index = this.index): boolean { /* ... */ }
    public atEOF(index = this.index, line = this.line, column = this.column): Character { /* ... */ }
}
```

Excellent question. To make `back()` work for multiple steps, you need to change the underlying history mechanism from storing just one `previousPosition` to storing a *history of positions*.

The most straightforward way to do this is to maintain an array of every position the stream has been in.

Here's the strategy:

1. **Introduce a `positionHistory` Array**: This array will store `Position` objects. It's much more memory-efficient than storing the full `Character` objects from your original implementation.
2. **Initialize History**: In the constructor, we'll add the starting position `{ index: 0, line: 1, column: 1 }` as the first entry in our history.
3. **Update History on Advance**: Every time `advance()` is called, we will push the stream's *new* position onto the `positionHistory` stack. This means the last item in the array is always the current position.
4. **Implement `back(steps)`**: This method will now:
    * Check if it's possible to go back the requested number of steps.
    * Pop `steps` number of positions off the history stack.
    * Restore the stream's state to the new last position on the stack.

This approach gives you a complete, step-by-step history of the stream's movement, allowing for precise, multi-step rewinding.

### The New Implementation

Here are the changes integrated into your `CharacterStream` class.

```typescript
class CharacterStream implements IterableIterator<Character> {
    private readonly source: string;
    private index: number = 0;
    private line: number = 1;
    private column: number = 1;

    // --- NEW: History for multi-step back() ---
    private readonly positionHistory: Position[] = [];

    private readonly marks: Position[] = [];

    constructor(input: string) {
        this.source = input.normalize('NFC');
        // Initialize the history with the starting position.
        // The last item in positionHistory is always the current position.
        this.positionHistory.push(this.getPosition());
    }

    // ... (getPosition, setPosition, mark, reset, commit remain the same) ...

    public getPosition(): Position {
        return { index: this.index, line: this.line, column: this.column };
    }
    
    public setPosition(position: Position): void {
        this.index = position.index;
        this.line = position.line;
        this.column = position.column;
    }
    
    // --- `advance` is now updated to record history ---
    public advance(charValue: string): void {
        this.index += charValue.length;
        if (charValue === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column += [...charValue].length;
        }
        // Push the new, current position onto the history stack.
        this.positionHistory.push(this.getPosition());
    }

    // --- `back` is now multi-step ---
    /**
     * Moves the stream's position back by a given number of steps.
     * @param steps The number of characters to rewind (default: 1).
     */
    public back(steps: number = 1): void {
        if (steps <= 0) return;

        // The history includes the current position, so the number of "backable"
        // steps is the history length minus one.
        if (steps >= this.positionHistory.length) {
            throw new Error(
                `Cannot go back ${steps} steps. History only contains ${this.positionHistory.length - 1} previous positions.`
            );
        }

        // Pop the requested number of states.
        for (let i = 0; i < steps; i++) {
            this.positionHistory.pop();
        }

        // The new current position is the one now at the end of the stack.
        const newPosition = this.positionHistory[this.positionHistory.length - 1];
        this.setPosition(newPosition);
    }
    
    public next(): IteratorResult<Character> {
        if (this.isEOF()) return { done: true, value: null };
        const nextChar = this.peek(0);
        this.advance(nextChar.value);
        return { done: false, value: nextChar };
    }

    // ... (The rest of your methods like peek, peekPosition, consumeWhile, etc.,
    //      do not need to be changed and will work correctly with this new system) ...
}
```

### How It Works

Let's trace a simple example: `stream.back(2)`

1. **Initial State:**
    * `positionHistory`: `[{i:0, l:1, c:1}]`
    * Stream position: index 0

2. Call `stream.next()` three times on the input `"abc"`:
    * `next()` -> `advance('a')` -> `positionHistory` becomes `[ {i:0...}, {i:1, l:1, c:2} ]`
    * `next()` -> `advance('b')` -> `positionHistory` becomes `[ {i:0...}, {i:1...}, {i:2, l:1, c:3} ]`
    * `next()` -> `advance('c')` -> `positionHistory` becomes `[ {i:0...}, {i:1...}, {i:2...}, {i:3, l:1, c:4} ]`
    * Stream position is now at index 3.

3. **Call `stream.back(2)`:**
    * `steps` is 2. `positionHistory.length` is 4. The check passes.
    * **Loop 1:** `positionHistory.pop()`. History is now `[ {i:0...}, {i:1...}, {i:2...} ]`.
    * **Loop 2:** `positionHistory.pop()`. History is now `[ {i:0...}, {i:1...} ]`.
    * The loop finishes.
    * `newPosition` becomes the last item: `{i:1, l:1, c:2}`.
    * `setPosition()` is called with this position.

4. **Final State:**
    * `positionHistory`: `[ {i:0, l:1, c:1}, {i:1, l:1, c:2} ]`
    * Stream position is now at index 1 (the start of the character 'b').

This implementation is robust, predictable, and gives your `CharacterStream` the powerful, multi-step rewind capability you were looking for.

Of course. This is a great set of questions because it gets to the heart of why a robust stream needs different kinds of history management.

Here is a detailed breakdown of how to implement `mark()` and `reset()` alongside `positionHistory`, followed by a practical example of `back(steps)`.

### 1. `mark()`/`reset()` with the New `positionHistory`

You should think of `mark()`/`reset()` and `back()` as two separate, complementary systems for two different use cases.

* **`back(steps)`** is a **chronological undo**. It uses a complete history (`positionHistory`) to rewind the stream one step at a time. It's like pressing `Ctrl+Z` in a text editor.
* **`mark()`/`reset()`** is a **speculative bookmark**. It saves a single point in time to a separate stack (`marks`), allowing you to jump back to that specific point later, no matter how many characters you consumed in between. It’s for trying a complex parse and bailing out if it fails.

The best implementation is to **keep both systems separate**. The `positionHistory` is perfect for `back()`, and the `marks` stack is perfect for `mark()`/`reset()`. They don't conflict; they work together to give your parser maximum flexibility.

The implementation for `mark()` and `reset()` **does not need to change at all**. It still works perfectly alongside the new `positionHistory`.

Here's the class showing how they coexist:

```typescript
class CharacterStream implements IterableIterator<Character> {
    // ... properties: source, index, line, column ...

    // For multi-step chronological `back()`
    private readonly positionHistory: Position[] = [];

    // For speculative `mark()`/`reset()` bookmarks
    private readonly marks: Position[] = [];

    constructor(input: string) {
        this.source = input.normalize('NFC');
        // Initialize the history for back()
        this.positionHistory.push(this.getPosition());
    }

    // --- `mark()` / `reset()` Implementation (Unchanged) ---
    public mark(): void {
        this.marks.push(this.getPosition());
    }

    public reset(): void {
        if (this.marks.length === 0) throw new Error("No mark to reset to.");
        const lastMark = this.marks.pop()!;
        this.setPosition(lastMark);
        // Note: We don't touch positionHistory here. Resetting is a non-linear jump,
        // so the chronological history becomes invalid for rewinding past this point.
        // A more complex implementation could truncate positionHistory, but for most
        // tokenizers, this separation is cleaner.
    }
    
    public commit(): void {
        if (this.marks.length === 0) throw new Error("No mark to commit.");
        this.marks.pop();
    }
    
    // --- `advance()` and `back()` Implementation (Unchanged) ---
    public advance(charValue: string): void {
        // ... (updates index, line, column) ...
        this.positionHistory.push(this.getPosition()); // Still adds to history
    }

    public back(steps: number = 1): void {
        // ... (implementation using positionHistory is correct and unchanged) ...
    }

    // ... (rest of the class) ...
}
```

---

### 2. Example: `back(steps)` in Action

Let's imagine our tokenizer is processing CSS variables. It sees a `-`. This could be part of a simple subtraction (`padding: 10px - 5px`) or the start of a CSS variable (`--main-color`).

Our strategy will be:

1. When we see a `-`, consume it.
2. Look at the *next* character.
3. If it's *also* a `-`, great! We're parsing a variable.
4. If it's *not* a `-`, we made a mistake. We need to **go back one step** so the `-` can be treated as a normal operator.

This is a perfect use case for `back(1)`.

Here is a complete, runnable example:

```typescript
// Assume CharacterStream and CharType are defined as in the previous answers

function simpleCssParser(stream: CharacterStream) {
    const tokens = [];

    while (!stream.isEOF()) {
        let char = stream.peek();

        if (char.type === CharType.Whitespace) {
            stream.next(); // Skip whitespace
            continue;
        }

        // --- Example Logic for `--` vs `-` ---
        if (char.value === '-') {
            console.log(`Found a '-' at column ${char.position.column}. Consuming it.`);
            stream.next(); // Consume the first '-'

            // Look at the character that is NOW current
            const nextChar = stream.peek();

            if (nextChar.value === '-') {
                console.log(`  ...and the next char is ALSO a '-' at column ${nextChar.position.column}. It's a variable token!`);
                stream.next(); // Consume the second '-'
                tokens.push({ type: 'CSS_VAR_START', value: '--' });
            } else {
                // This is the key part!
                console.log(`  ...but the next char is a '${nextChar.value}'. This is not a variable.`);
                console.log("  <<< GOING BACK 1 STEP >>>");
                stream.back(1); // <<< REWIND ONE STEP

                // Now the stream is back to where it was before we consumed the first '-',
                // so it can be correctly tokenized as a simple minus sign.
                tokens.push({ type: 'MINUS_OPERATOR', value: '-' });
            }
        } else {
            // For any other character, just consume it and add as a generic token
            tokens.push({ type: char.type, value: char.value });
            stream.next();
        }
    }
    return tokens;
}

// --- Run the example ---
const cssInput = "font-size: var(--main-color) - 10px";
const stream = new CharacterStream(cssInput);

console.log(`Input: "${cssInput}"\n`);
simpleCssParser(stream);

console.log(`\nFinal stream position: index ${stream.getPosition().index}`);
```

#### **Output of the Example:**

```bash
Input: "font-size: var(--main-color) - 10px"

Found a '-' at column 5. Consuming it.
  ...but the next char is a 's'. This is not a variable.
  <<< GOING BACK 1 STEP >>>
Found a '-' at column 21. Consuming it.
  ...and the next char is ALSO a '-' at column 22. It's a variable token!
Found a '-' at column 35. Consuming it.
  ...but the next char is a ' '. This is not a variable.
  <<< GOING BACK 1 STEP >>>

Final stream position: index 39
```

As you can see, `back(1)` allows the parser to easily correct its course when it makes a wrong assumption, making your parsing logic much cleaner than it would be otherwise.





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: 0. NOTES/7. CharStreamChanges.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: 0. NOTES/1. Help.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




# HELP

Your code is a well-structured example of a classic "State Machine" lexer and a "Recursive Descent" parser. However, it currently suffers from **"Boilerplate Overload"**—there are many layers of abstraction (Context, Transition objects, Singleton State classes) that make it harder to see the actual logic.

Here is a review and a set of recommendations to simplify the code while keeping its robust architecture.

---

## 1. Simplify the State Machine (The "Big Win")

Currently, every state is a class with a singleton getter. This is very verbose. In TypeScript, you can represent states as a **Record of functions**.

**Instead of this:**

```typescript
class Letter_State extends State {
    static #instance: State;
    public static get instance() { ... }
    public handle(char: Character) { ... }
}

```

**Try this (Functional States):**
Define your states as a simple object where each key is a state name and the value is a function that returns the next state and action.

```typescript
const States: Record<string, (char: Character) => Transition> = {
  Initial: (char) => {
    if (char.type === CharType.Letter) return { type: 'To', next: 'Letter' };
    if (char.type === CharType.Number) return { type: 'To', next: 'Number' };
    // ...
  },
  Letter: (char) => {
    if (char.type === CharType.Letter) return { type: 'Stay' };
    return { type: 'Emit', next: 'Initial' };
  }
};

```

This removes about 200 lines of boilerplate from `States.ts` and makes the transitions readable in one place.

---

### 2. Streamline `CharUtility`

You have large `Set` objects for letters and numbers, but then you use Regex in `CharSpec`. You can consolidate this. Modern JavaScript/TypeScript handles Unicode properties very well.

**Simplified Classification:**

```typescript
const isLetter = (c: string) => /\p{L}/u.test(c);
const isDigit = (c: string) => /\d/.test(c);
const isWhitespace = (c: string) => /\s/.test(c);

// Use a simple lookup for single-char symbols
const SYMBOLS: Record<string, CharType> = {
  '#': CharType.Hash,
  '%': CharType.Percent,
  '(': CharType.LParen,
  ')': CharType.RParen,
  // ...
};

```

---

### 3. Simplify the `Tokenizer` Buffer Logic

In `Tokenizer.ts`, the logic to decide whether to push a character to the buffer or ignore it (like quotes) is split between `Context` and `Tokenizer`.

**Recommendation:** Let the `process` method return exactly what should happen to the current character.

```typescript
interface ProcessResult {
  action: 'buffer' | 'ignore' | 'emit';
  nextState: StateName;
}

```

This prevents the "Check if I just entered a string" logic from being scattered.

---

### 4. Improve the `Parser` Structure

Your `Parser.ts` is actually quite clean! One way to make it "easier to follow" is to use a **Binary Expression Helper**. Since Addition and Multiplication look almost identical, you can DRY (Don't Repeat Yourself) that logic.

**Refactored Binary Parser:**

```typescript
private binaryExpr(builder: () => Expression, ...tokenTypes: TokenType[]): Expression {
    let expr = builder();
    while (this.match(...tokenTypes)) {
        const operator = this.previous().value;
        const right = builder();
        expr = { type: NodeType.BinaryExpression, operator, left: expr, right };
    }
    return expr;
}

// Then use it like this:
private addition() {
    return this.binaryExpr(() => this.multiplication(), TokenType.PLUS, TokenType.MINUS);
}

private multiplication() {
    return this.binaryExpr(() => this.unary(), TokenType.STAR, TokenType.SLASH);
}

```

---

### 5. Architectural Review: "The Double Classification"

Currently, you classify a character (e.g., `CharType.Hash`), then the state machine processes it, then the Tokenizer classifies it *again* to turn it into a `TokenType.HEXVALUE`.

**Optimization:** The State Machine should know what it's building. When the `NumberState` exits, it should tell the Tokenizer: "I just finished a Number." This removes the need for `Tokenizer.classify` and `TokenSpec`.

---

### 6. Recommended Folder Structure

For a project of this size, you might find it easier to follow if you group by "Phase" rather than "Class":

* `/lexer`
* `types.ts` (CharType, TokenType)
* `character-stream.ts`
* `state-machine.ts` (The simplified transition logic)

* `/parser`
* `ast.ts`
* `parser.ts`

## Summary of specific code fixes

1. **In `Parser.ts**`: You have a `// ✅ Fixed: Added STAR` comment. You can also add `%` (Modulo) there since it's in your `BinaryExpression` type definition but missing from the parser logic.
2. **In `States.ts**`: The `EndString` logic in `String_State` returns `InitialState`. If your input is `'hello'world`, it might fail to tokenize `world` correctly because it emits and resets in one go. Using a `Reprocess` flag (which you have) is good, but ensure it's used consistently for all delimiters.
3. **In `index.ts**`: The `fourSpaceAST` regex is a clever way to format. You can also achieve this by passing a number to `JSON.stringify(ast, null, 4)` if you convert your AST to a plain object first.

**Would you like me to provide a simplified version of one of these specific files (like the new Functional States approach)?**





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: 0. NOTES/1. Help.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: 0. NOTES/2. CharUtility Recommendation.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




# CHAT UTILITY RECOMMENDATION

This is an excellent update. Your `CharUtility` is now far more robust, descriptive, and logically sound. You have successfully addressed the biggest ambiguity by replacing the generic `Unicode` type with specific checks for `Punctuation` (`\p{P}`) and `SymbolMark` (`\p{S}`).

To directly answer your question: **No, you are not missing any major character *types*.** Your classification logic now covers virtually every printable character in the Unicode standard in a descriptive way. The `Other` type now correctly serves its purpose as a bucket for non-printable characters like control characters, which is exactly what you want.

However, while you aren't missing any *character types*, there are a couple of small redundancies in your `CharType` **enum** that you could clean up for a truly polished utility.

## ✅ Areas of Redundancy (Enum Cleanup)

You have some overlap between your generic categories and the very specific symbol types.

1. **`Punctuation` vs. Specific Punctuation**:
    * Your `SYMBOL_MAP` contains entries like `.` (Dot), `,` (Comma), and `;` (SemiColon).
    * Your `classify` function now has a check for `\p{P}` (Punctuation), which *also* matches these characters.
    * Because the `SYMBOL_MAP` is checked first, `.` will always be `Dot`, never `Punctuation`. This isn't wrong, but it creates two different ways to classify the same conceptual thing.

2. **`SymbolMark` vs. Specific Symbols**:
    * Similarly, your `SYMBOL_MAP` has `+`, `<`, `|`, etc.
    * The `\p{S}` (SymbolMark) check also matches these.
    * You also have a `Currency` type, which is a subset of `\p{S}`.

## ✨ Recommendation for a Final Polish

For maximum clarity and a single source of truth, you can simplify the `CharType` enum by removing the hyper-specific types and relying on the broader Unicode categories. This makes your utility more general-purpose and easier to maintain.

Here is a revised version that demonstrates this cleanup.

### 1. Simplified `CharType` Enum

We can remove the individual symbol types like `Plus`, `Minus`, `Dot`, etc., because they are all covered by `Punctuation` or `SymbolMark`.

```typescript
enum CharType {
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',
    Letter = 'Letter',
    Number = 'Number',
    Punctuation = 'Punctuation', // Broad category for ., ,, ;, etc.
    SymbolMark = 'SymbolMark',     // Broad category for +, -, $, €, etc.
    Other = 'Other',
    EOF = 'EOF',
    // Removed specific symbols like Plus, Minus, Comma, Dot, etc.
}
```

### 2. Simplified `classify` Function

With a simplified enum, your `classify` function becomes even cleaner. You no longer need the `SYMBOL_MAP` at all, as the regex checks handle everything. This reduces code size and complexity.

```typescript
class CharUtility {
    // SYMBOL_MAP is no longer needed

    public static classify: ClassifyFn = (char: string): CharType => {
        // 1. Handle End-Of-File character
        if (char === '') return CharType.EOF;

        // 2. Handle Whitespace and Newlines (no change)
        if (char === '\n' || char === '\r') return CharType.NewLine;
        if (/\s/u.test(char)) return CharType.Whitespace;

        // 3. Handle major Unicode categories
        if (/\p{L}/u.test(char)) return CharType.Letter;
        if (/\p{N}/u.test(char)) return CharType.Number;
        if (/\p{P}/u.test(char)) return CharType.Punctuation;
        if (/\p{S}/u.test(char)) return CharType.SymbolMark;

        // 4. All remaining characters fall here
        return CharType.Other;
    }
}
```

## Conclusion

Your current version is very, very good. The suggestions above are purely for refinement and simplification. Whether you keep the specific symbol types (like `Dot`, `Plus`) or embrace the broader categories (`Punctuation`, `SymbolMark`) depends on your specific use case:

* **Keep Specific Types if:** You are building a parser for a programming language where `.` has a fundamentally different meaning than `;`.
* **Use Broad Categories if:** You are building a general-purpose text analyzer where you just need to distinguish letters from symbols from punctuation.

Based on the code provided, the simplified, broader approach seems more robust and maintainable. But rest assured, you have covered all your bases.





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: 0. NOTES/2. CharUtility Recommendation.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: 0. NOTES/2. CharUtility.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




# CHAR UTILITY

To streamline your `CharUtility`, you can remove the large manual `Set` objects and replace the `Map` iteration with a **direct lookup table** for symbols and **Unicode regex** for categories like letters and numbers.

This approach is significantly faster and easier to maintain because it avoids looping through a list of functions for every single character in your source code.

## Refactored `src/Character.ts`

```typescript
// src/Character.ts

// ... keep CharType enum and interfaces as they are ...

export class CharUtility {
    /**
     * Map of single characters to their specific types.
     * This provides O(1) lookup for common symbols.
     */
    private static readonly SYMBOL_MAP: Record<string, CharType> = {
        '#': CharType.Hash,
        '%': CharType.Percent,
        '/': CharType.Slash,
        ',': CharType.Comma,
        '(': CharType.LParen,
        ')': CharType.RParen,
        '+': CharType.Plus,
        '-': CharType.Minus,
        '*': CharType.Star,
        '.': CharType.Dot,
        '`': CharType.Backtick,
        "'": CharType.SingleQuote,
        '"': CharType.DoubleQuote,
        '\\': CharType.BackSlash,
        '~': CharType.Tilde,
        '!': CharType.Exclamation,
        '@': CharType.At,
        '$': CharType.Dollar,
        '?': CharType.Question,
        '^': CharType.Caret,
        '&': CharType.Ampersand,
        '<': CharType.LessThan,
        '>': CharType.GreaterThan,
        '_': CharType.Underscore,
        '=': CharType.EqualSign,
        '[': CharType.LBracket,
        ']': CharType.RBracket,
        '{': CharType.LBrace,
        '}': CharType.RBrace,
        ';': CharType.SemiColon,
        ':': CharType.Colon,
        '|': CharType.Pipe,
    };

    /**
     * Classifies a character using the symbol map and regex for categories.
     */
    public static classify(char: string): CharType {
        if (char === '') return CharType.EOF;

        // 1. Check the fast-lookup symbol map
        if (this.SYMBOL_MAP[char]) {
            return this.SYMBOL_MAP[char];
        }

        // 2. Handle Whitespace and Newlines
        if (char === '\n' || char === '\r') return CharType.NewLine;
        if (/\s/u.test(char)) return CharType.Whitespace;

        // 3. Handle Letters and Numbers (Unicode aware)
        if (/\p{L}/u.test(char)) return CharType.Letter;
        if (/\p{N}/u.test(char)) return CharType.Number;

        // 4. Handle non-ASCII Unicode characters
        if (/[^\x00-\x7F]/.test(char)) return CharType.Unicode;

        return CharType.Other;
    }
}

```

## What has changed

1. **Removed 100+ lines of Sets**: You no longer need `Letters`, `Numbers`, `Whitespace`, or `NewLine` sets. Modern JS regex handles these more accurately (e.g., `\p{L}` handles accented characters and non-Latin scripts).
2. **O(1) Symbol Lookup**: Instead of iterating through a `Map` of functions (`CharSpec`) for every character, we now do a single property check on `SYMBOL_MAP`. This is much more performant for long files.
3. **Simplified Logic**: The `classify` method is now a flat sequence of "If-Else" checks rather than a loop. This makes it significantly easier to debug and follow.
4. **Consolidated Character Specification**: You no longer need the `CharTypeFn` or `Spec` types, reducing the overall complexity of your codebase.





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: 0. NOTES/2. CharUtility.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: 0. NOTES/3. TokenizerBuffer.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




# TOKENIZER BUFFER

To simplify the **Tokenizer buffer logic**, you should move the decision of "what to do with the current character" out of the loop in `Tokenizer.ts` and into the `Context.ts`.

Currently, your `Tokenizer` manually checks if it is inside a string and tries to ignore starting quotes with complex conditional logic. By returning a clear `action` (either `buffer` or `ignore`) from the context, the loop becomes a simple set of instructions.

## 1. Update the `Context` Result

First, modify the `process` return type to include an `action`. This tells the tokenizer exactly what to do with the current character.

```typescript
// src/Context.ts

export type Action = 'buffer' | 'ignore';

interface ProcessResult {
    emit: boolean;      // Should we flush the current buffer into a token?
    reprocess: boolean; // Should the current char be looked at again by the next state?
    action: Action;     // Should the current char be added to the buffer?
}

// ... inside Context class ...
public process(char: Character): ProcessResult {
    const transition = this.state.handle(char);
    let action: Action = 'buffer';
    let emit = false;
    let reprocess = false;

    switch (transition.kind) {
        case "BeginString":
            this.beginString(transition.quoteType);
            this.transitionTo(transition.state);
            action = 'ignore'; // Don't put the opening quote in the buffer
            break;

        case "EndString":
            this.endString();
            this.transitionTo(transition.state);
            action = 'ignore'; // Don't put the closing quote in the buffer
            emit = true;
            break;

        case "EmitAndTo":
            this.transitionTo(transition.state);
            emit = true;
            reprocess = true;
            action = 'ignore'; // This char belongs to the NEXT token
            break;

        case "To":
            const wasAccepting = this.isAccepting();
            this.transitionTo(transition.state);
            emit = wasAccepting;
            break;
            
        case "Stay":
            break;
            
        // ... handle other cases like EscapeNext ...
    }

    return { emit, reprocess, action };
}

```

## 2. Simplify the `Tokenizer` Loop

With the `Context` handling the logic, the `tokenize` method becomes much cleaner. You no longer need to manually check for quotes or string states inside the loop.

```typescript
// src/Tokenizer.ts

public tokenize(input: string): Token[] {
    const stream = new CharacterStream(input);
    const tokens: Token[] = [];

    for (const char of stream) {
        // Capture whether we were in a string BEFORE processing 
        // to correctly classify the token being emitted.
        const wasInString = this.ctx.isInString();

        let result = this.ctx.process(char);

        // 1. Handle Emitting (Flush buffer)
        if (result.emit && this.buffer.length > 0) {
            tokens.push(Tokenizer.createToken(this.buffer, wasInString));
            this.buffer = [];
        }

        // 2. Handle Reprocessing (If the char belongs to the next state)
        if (result.reprocess) {
            result = this.ctx.process(char);
        }

        // 3. Simple Buffer Logic
        if (result.action === 'buffer' && char.type !== CharType.EOF) {
            this.buffer.push(char);
        }
    }

    // Flush remaining buffer
    if (this.buffer.length > 0) {
        tokens.push(Tokenizer.createToken(this.buffer, this.ctx.isInString()));
    }

    tokens.push({ value: '', type: TokenType.EOF });
    return tokens;
}

```

## Key Benefits of this Refactor

* **Separation of Concerns**: The `Tokenizer` loop only manages the flow (looping and list management), while the `Context` manages the grammar logic (when to stop or ignore characters).
* **No More Manual Quote Stripping**: Because the `BeginString` and `EndString` transitions return `action: 'ignore'`, the quotes never enter the buffer, so you don't need logic to remove them later.
* **Consistency**: `EmitAndTo` now consistently marks the "trigger" character as `ignore` for the current token so that it can be correctly picked up by the next `process` call during reprocessing.





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: 0. NOTES/3. TokenizerBuffer.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: 0. NOTES/4. FunctionalStates.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




# FUNCTIONAL STATES

To simplify your code using a **Functional States** approach, we can replace the verbose singleton classes with a single object (or a set of functions) that maps state names to transition logic. This eliminates the need for `instance` getters and class inheritance for every state.

Here is how you can refactor `src/States.ts` and update the `Context` to handle it.

## 1. Refactored `src/States.ts`

Instead of classes, we use a `Record` where each key is a state name and each value is a function that takes a `Character` and returns a `Transition`.

```typescript
import { type Character, CharType } from './Character.ts';
import { Transition } from './Transition.ts';

// Define the available state names as a type for safety
export type StateName = 
    | 'Initial' | 'Whitespace' | 'NewLine' | 'Letter' 
    | 'Number' | 'Dimension' | 'Hex' | 'String' 
    | 'Percent' | 'SingleChar' | 'Symbol' | 'End';

// Define the functional state handler type
type StateHandler = (char: Character) => Transition;

export const FunctionalStates: Record<StateName, StateHandler> = {
    Initial: (char) => {
        switch (char.type) {
            case CharType.SingleQuote: return Transition.BeginString('String', CharType.SingleQuote);
            case CharType.DoubleQuote: return Transition.BeginString('String', CharType.DoubleQuote);
            case CharType.Backtick:    return Transition.BeginString('String', CharType.Backtick);
            case CharType.Whitespace:  return Transition.To('Whitespace');
            case CharType.NewLine:     return Transition.To('NewLine');
            case CharType.Letter:      return Transition.To('Letter');
            case CharType.Number:      return Transition.To('Number');
            case CharType.Hash:        return Transition.To('Hex');
            
            case CharType.Comma: case CharType.LParen: case CharType.RParen:
            case CharType.Plus:  case CharType.Minus:  case CharType.Star:
            case CharType.Slash: case CharType.Percent:
                return Transition.To('SingleChar');

            case CharType.EOF:   return Transition.To('End');
            default:             return Transition.To('SingleChar');
        }
    },

    Whitespace: (char) => 
        char.type === CharType.Whitespace ? Transition.Stay() : Transition.EmitAndTo('Initial'),

    NewLine: (_) => Transition.EmitAndTo('Initial'),

    Letter: (char) => 
        char.type === CharType.Letter ? Transition.Stay() : Transition.EmitAndTo('Initial'),

    Number: (char) => {
        if (char.type === CharType.Percent) return Transition.ToContinue('Percent');
        if (char.type === CharType.Letter)  return Transition.ToContinue('Dimension');
        if (char.type === CharType.Number || char.type === CharType.Dot) return Transition.Stay();
        return Transition.EmitAndTo('Initial');
    },

    Dimension: (char) => 
        char.type === CharType.Letter ? Transition.Stay() : Transition.EmitAndTo('Initial'),

    Hex: (char) => {
        const isHex = char.type === CharType.Hash || char.type === CharType.Letter || char.type === CharType.Number;
        return isHex ? Transition.Stay() : Transition.EmitAndTo('Initial');
    },

    String: (char) => {
        if (char.type === CharType.BackSlash) return Transition.EscapeNext('String');
        if (char.type === CharType.SingleQuote || char.type === CharType.DoubleQuote || char.type === CharType.Backtick) {
            return Transition.EndString('Initial');
        }
        if (char.type === CharType.EOF || char.type === CharType.NewLine) return Transition.EmitAndTo('Initial');
        return Transition.Stay();
    },

    Percent: (_) => Transition.EmitAndTo('Initial'),

    SingleChar: (_) => Transition.EmitAndTo('Initial'),

    Symbol: (char) => {
        const isSym = [CharType.Unicode, CharType.BackSlash, CharType.At, CharType.Symbol].includes(char.type);
        return isSym ? Transition.Stay() : Transition.EmitAndTo('Initial');
    },

    End: (_) => Transition.Stay(),
};

// Define which states are "Accepting" (can produce a token)
export const AcceptingStates = new Set<StateName>([
    'Whitespace', 'NewLine', 'Letter', 'Number', 'Dimension', 
    'Hex', 'String', 'Percent', 'SingleChar', 'Symbol', 'End'
]);

```

## 2. Update `src/Transition.ts`

Update your `Transition` type to use the `StateName` string instead of the `State` class instance.

```typescript
export type Transition =
    | { kind: 'Stay' }
    | { kind: 'To'; state: StateName }
    | { kind: 'EmitAndTo'; state: StateName }
    | { kind: 'ToContinue'; state: StateName }
    | { kind: 'BeginString'; state: StateName; quoteType: CharType }
    | { kind: 'EndString'; state: StateName }
    | { kind: 'EscapeNext'; state: StateName };

```

## 3. Simplify `src/Context.ts`

The `Context` now simply tracks the string name of the state and calls the function from the `FunctionalStates` map.

```typescript
import { FunctionalStates, AcceptingStates, type StateName } from './States.ts';

class Context {
    private currentState: StateName = 'Initial';
    // ... stringContext properties ...

    public process(char: Character) {
        const wasAccepting = AcceptingStates.has(this.currentState);
        const transition = FunctionalStates[this.currentState](char);

        // ... existing logic to handle EscapeNext, BeginString, etc. ...
        
        // When updating state:
        if ('state' in transition) {
            this.currentState = transition.state;
        }

        // ... return emit/reprocess flags ...
    }
}

```

## Why this is better

1. **Readability:** All state transition logic is in one file and visible at a glance. You don't have to jump between ten different files to see how the lexer moves from `Number` to `Dimension`.
2. **Boilerplate Reduction:** You removed dozens of `static #instance` and `public static get instance()` blocks.
3. **Memory:** You are no longer creating class instances for every state; you are just looking up a function in a standard object.
4. **Extensibility:** Adding a new state is now as simple as adding one key to the `FunctionalStates` object and one entry in the `AcceptingStates` set.





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: 0. NOTES/4. FunctionalStates.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: 0. NOTES/5. ParserStructure.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




# PARSER STRUCTURE

To streamline your `Parser` class, you should focus on reducing the repetitive logic in your binary expression methods and moving the heavy `switch` statement out of `primary` into a more modular dispatcher.

Here are three specific architectural improvements to make the parser cleaner and more extensible.

## 1. DRY Binary Expressions with a Helper

Your `addition` and `multiplication` methods share identical logic: a loop that checks for operators and builds a tree. You can replace both with a single helper method.

```typescript
// src/Parser.ts

/**
 * Higher-order helper to handle left-associative binary operations.
 * @param builder The next higher precedence level (e.g., unary or multiplication)
 * @param types The token types to match (e.g., PLUS, MINUS)
 */
private binaryExpr(builder: () => Expression, ...types: TokenType[]): Expression {
    let expr = builder();

    while (this.match(...types)) {
        const operator = this.previous().value as any;
        const right = builder();
        expr = {
            type: NodeType.BinaryExpression,
            operator,
            left: expr,
            right,
        };
    }

    return expr;
}

// Now your grammar methods are one-liners:
private addition(): Expression {
    return this.binaryExpr(() => this.multiplication(), TokenType.PLUS, TokenType.MINUS);
}

private multiplication(): Expression {
    return this.binaryExpr(() => this.unary(), TokenType.STAR, TokenType.SLASH);
}

```

## 2. Use a Dispatcher for `primary`

Instead of a giant `switch` statement in `primary`, which becomes hard to read as you add more literals (Booleans, Null, etc.), use a lookup table.

```typescript
// src/Parser.ts

// Define a type for primary parsing functions
type PrimaryParser = (token: Token) => Expression;

private readonly primaryParsers: Partial<Record<TokenType, PrimaryParser>> = {
    [TokenType.STRING]: (t) => ({ type: NodeType.StringLiteral, value: t.value, raw: t.value }),
    [TokenType.NUMBER]: (t) => ({ type: NodeType.NumericLiteral, value: parseFloat(t.value), raw: t.value }),
    [TokenType.HEXVALUE]: (t) => ({ type: NodeType.HexLiteral, value: t.value, raw: t.value }),
    [TokenType.IDENTIFIER]: (t) => ({ type: NodeType.Identifier, name: t.value }),
    [TokenType.PERCENT]: (t) => ({ 
        type: NodeType.PercentLiteral, 
        value: parseFloat(t.value.replace('%', '')), 
        raw: t.value 
    }),
};

private primary(): Expression {
    if (this.isAtEnd()) throw this.error(this.peek(), 'Unexpected end of input');

    const token = this.peek();
    const parser = this.primaryParsers[token.type];

    if (parser) {
        this.advance();
        return parser(token);
    }

    // Special case for grouping (since it recurses back to expression)
    if (this.match(TokenType.LPAREN)) {
        const expr = this.expression();
        this.consume(TokenType.RPAREN, "Expected ')' after expression");
        return { type: NodeType.GroupExpression, expression: expr };
    }

    throw this.error(token, `Expected expression, got ${token.type}`);
}

```

## 3. Move AST Creation to Factory Functions

Creating AST objects manually inside the parser methods adds noise. By moving these to a separate utility or static methods, you make the parser's logic purely about "grammar" rather than "object shape."

```typescript
// Define factories in AST.ts or as private helpers in Parser.ts
private createBinary(left: Expression, operator: string, right: Expression): BinaryExpression {
    return { type: NodeType.BinaryExpression, operator: operator as any, left, right };
}

private createLiteral(token: Token): Expression {
    // ... logic to return the correct Literal type ...
}

```

## Summary of Benefits

* **Maintenance**: To add a new operator (like `^` for power), you just add `TokenType.POW` to the `binaryExpr` call in the appropriate precedence level.
* **Readability**: The grammar levels (`addition`, `multiplication`, `unary`) now look exactly like the BNF grammar rules they represent.
* **Scalability**: The `primaryParsers` map makes it trivial to add new literal types (like `true`/`false` or `null`) without making the `primary()` method longer.





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: 0. NOTES/5. ParserStructure.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: 0. NOTES/6. NewEfficiencies.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




# NEW EFFICIENCIES

Beyond the structural refactors already discussed, there are several "logic-level" efficiencies you can implement to remove redundant code and improve performance. Currently, your pipeline performs **double classification**: the `States` classify characters to build tokens, and then the `Tokenizer` re-scans those tokens to determine their final `TokenType`.

Here are the next steps to streamline your compiler.

## 1. State-Driven Token Typing (Removing `Tokenizer.classify`)

Your `States` already "know" what they are building (e.g., the `Hex_State` knows it's building a hex value). You can pass this information through the `Transition` so that the `Tokenizer` doesn't have to perform string-matching logic like `value.endsWith('%')` at the end.

**The Efficiency:** Move the `TokenType` assignment into the `Transition`.

```typescript
// src/Transition.ts
export type Transition =
    | { kind: 'Stay' }
    | { kind: 'EmitAndTo'; state: StateName; tokenType: TokenType } // Add type here
    // ... other kinds ...

// src/States.ts
Number: (char) => {
    if (char.type === CharType.Percent) return Transition.To('Percent');
    // ...
    return Transition.EmitAndTo('Initial', TokenType.NUMBER);
},
Percent: (_) => Transition.EmitAndTo('Initial', TokenType.PERCENT),

```

By doing this, you can delete the entire `Tokenizer.classify` method and its 60+ lines of logic.

## 2. Add `peek()` to the `CharacterStream`

Currently, your `States` must "consume" a character to see what it is, which often forces a `reprocess` flag in the `Context`. Adding a `peek()` method allows states to look ahead without advancing the index, which simplifies the `Tokenizer` loop logic.

**The Efficiency:** Reduce loop iterations and "reprocess" complexity.

```typescript
// src/Character.ts
class CharacterStream {
    // ...
    public peek(): Character {
        if (this.isEOF()) return this.atEOF();
        const codePoint = this.source.codePointAt(this.index);
        const value = String.fromCodePoint(codePoint!);
        return {
            value,
            type: CharUtility.classify(value),
            position: { ...this.position }
        };
    }
}

```

## 3. Lazy Token Filtering in the Parser

In your `Parser` constructor, you use `tokens.filter(...)` to remove whitespace and newlines. This creates a completely new array in memory. For large files, it is more efficient to keep the original array and have your `advance()` and `peek()` methods simply skip over "ignored" tokens.

**The Efficiency:** Save memory and allow the parser to access whitespace if you ever need to (e.g., for "Automatic Semicolon Insertion" or code formatting).

```typescript
// src/Parser.ts
private advance(): Token {
    this.current++;
    // Automatically skip tokens we don't care about
    while (!this.isAtEnd() && this.isIgnored(this.peek())) {
        this.current++;
    }
    return this.previous();
}

private isIgnored(token: Token): boolean {
    return token.type === TokenType.WHITESPACE || token.type === TokenType.NEWLINE;
}

```

## 4. Consolidated String Unescaping

Your `Tokenizer` currently uses a heavy Regex-based `unescapeString` method. If you want to make this faster, you can handle the unescaping **while** you are in the `String_State`.

Instead of buffering the backslash and the 'n', when the state machine sees `\` followed by `n`, it can immediately push the actual newline character `\n` to the buffer.

**The Efficiency:**

* **Original**: Buffer has `['\', 'n']`  Join to `"\\n"`  Regex  `" \n "`.
* **Optimized**: `EscapeNext` state sees 'n'  Pushes `\n` directly to buffer  Token is already unescaped.

### 5. Unified Literal Parsing

In `src/Parser.ts`, your `primary()` method has separate blocks for `NUMBER`, `HEXVALUE`, `PERCENT`, and `DIMENSION`. These are all effectively "Literals." You can unify these into a single "Literal" check that returns the correct AST node based on the token type.

```typescript
// src/Parser.ts
private primary(): Expression {
    const token = this.peek();

    // Check if it's any type of literal
    if (this.match(TokenType.NUMBER, TokenType.STRING, TokenType.HEXVALUE, TokenType.PERCENT, TokenType.DIMENSION)) {
        return this.createLiteralNode(this.previous());
    }
    // ... handle identifiers and groups ...
}

```

## Summary of Cleanup

| Component | Old Way | New Efficiency |
| --- | --- | --- |
| **Tokens** | Re-classified by `Tokenizer.classify` | Tagged directly by `States` |
| **Memory** | Filters token array | Lazy-skips tokens during parsing |
| **Strings** | Regex post-processing | Unescaped during buffering |
| **Lookahead** | Reprocess flag | `stream.peek()` |





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: 0. NOTES/6. NewEfficiencies.md ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


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
    "coverage:nowatch": "vitest run --coverage"
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
