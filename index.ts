// ./index.ts

import { inspect, type InspectOptions } from 'node:util';
import { Tokenizer } from './src/Tokenizer.ts';
import { Parser } from './src/Parser.ts';

const OinspectOptions: InspectOptions = {
    showHidden: false,
    depth: null,
    colors: true,
    compact: false,
};

const inspectOptions: InspectOptions = {
    showHidden: true,
    depth: null,
    colors: true,
    customInspect: false,
    showProxy: false,
    maxArrayLength: null,
    maxStringLength: null,
    breakLength: 100,
    compact: true,
    sorted: false,
    getters: false,
    numericSeparator: true,
};

console.log('\n=== TOKENIZATION & PARSING DEMO ===\n');

// Test cases
const testCases = [
    //'1 + 2',
    //'10 - 5 + 3',
    //'2 * 3 + 4',
    'rgb(255, 0, 0)',
    //'#ff0000',
    //'50%',
    //'(1 + 2) * 3',
    //'-5 + 10',
    //'rgba(255, 128, 0, 50%)',
];

for (const input of testCases) {

    // Step 1: Tokenize
    const tokenizer = new Tokenizer();
    const tokens = tokenizer
        .withLogging()
        .tokenizeString(input);

    // Step 2: Parse
    const parser = new Parser(tokens);
    const ast = parser.parse();

    console.log('\nAST:');
    console.log('\t', inspect(ast, inspectOptions));
}

const old_test = () => {
    const inspectOptions: InspectOptions = {
        showHidden: true,
        depth: null,
        colors: true,
        customInspect: false,
        showProxy: false,
        maxArrayLength: null,
        maxStringLength: null,
        breakLength: 100,
        compact: true,
        sorted: false,
        getters: false,
        numericSeparator: true,
    };

    // Fluent usage
    const tokenizer = new Tokenizer();

    // Test 1
    tokenizer
        .withLogging('TEST (1): Direct Tokenization from String')
        .tokenizeString('67 a b c 1 word 2 3+2-0');

    // Test 2
    const characters = tokenizer
        .withLogging('TEST (2): Character Stream Only')
        .getCharacters('67 a b c 1 word 2 3+2-0');

    // Test 3
    tokenizer
        .withLogging('TEST (3): Tokenize from Character Array')
        .tokenizeCharacters(characters);

    // Test 4 - With logging
    const newChar = tokenizer
        .withLogging('TEST (4): Character Stream and Tokenize from Character Array')
        .getCharacters('quick test')

    // Test 4 - Without logging
    const tokens = tokenizer.tokenizeCharacters(newChar);

    // ...output for testing only
    for (const t of tokens) {
        console.log('\nTOKEN:', inspect(t, inspectOptions));
    }

    // Test 5
    tokenizer
        .withLogging('TEST (5): Direct Tokenization from CSS Color String')
        .tokenizeString('rgba(100 128 255 / 0.5)');

    // Test 6
    tokenizer
        .withLogging('TEST (6): Direct Tokenization from CSS Color String')
        .tokenizeString('rgba(100% 360 220  / 50%)');

    // Test 7
    tokenizer
        .withLogging('TEST (7): Direct Tokenization from Hex Color String')
        .tokenizeString('#ff00ff00');
}