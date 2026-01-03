// ./index.ts

import { inspect, type InspectOptions } from 'node:util';
import { Tokenizer } from './src/Tokenizer.ts';
import { Parser } from './src/Parser.ts';

const line = (newLine: boolean = true, width: number = 80): void => {
    if (newLine) console.log(`${'─'.repeat(width)}\n`);
    if (!newLine) console.log(`${'─'.repeat(width)}`);
}

const tokenizerTest = () => {
    // Fluent usage
    const tokenizer = new Tokenizer();

    // Test 1
    tokenizer
        .withLogging('TEST (1): Direct Tokenization from String')
        .tokenizeString('67 a b c 1 word 2 3+2-0');

    // Test 2
    tokenizer
        .withLogging('TEST (2): Direct Tokenization from CSS Color String')
        .tokenizeString('rgba(100 128 255 / 0.5)');

    // Test 3
    tokenizer
        .withLogging('TEST (3): Direct Tokenization from CSS Color String')
        .tokenizeString('rgba(100% 360 220  / 50%)');

    // Test 4
    tokenizer
        .withLogging('TEST (4): Direct Tokenization from Hex Color String')
        .tokenizeString('#ff00ff00');
}

const inspectOptions: InspectOptions = {
    showHidden: true,
    depth: null,
    colors: true,
    customInspect: false,
    showProxy: false,
    maxArrayLength: null,
    maxStringLength: null,
    breakLength: 100,
    compact: false,
    sorted: false,
    getters: false,
    numericSeparator: true,
};

const parserTest = () => {
    console.log('\n=== TOKENIZATION & PARSING DEMO ===\n');

    // Test cases
    // Commented out cases are not working
    const testCases = [
        '1 + 2',
        '10 - 5 + 3',
        '2 * 3 + 4',
        'rgb(255, 0, 0)',
        //'#ff0000',
        //'50%',
        '(1 + 2) * 3',
        '-5 + 10',
        //'rgba(255, 128, 0, 50%)',
    ];

    for (const input of testCases) {
        line();

        // Step 1: Tokenize
        const tokenizer = new Tokenizer();
        const tokens = tokenizer
            .withLogging(`TEST (${input}): Parsing different inputs`)
            .tokenizeString(input);

        // Step 2: Parse
        const parser = new Parser(tokens);
        const ast = parser.parse();

        // Step 3: Console log the AST
        console.log('\nAST:\n');
        const defaultAST = inspect(ast, inspectOptions);
        const fourSpaceAST = defaultAST.replace(/^ +/gm, match => ' '.repeat(match.length * 2));
        console.log(fourSpaceAST, '\n');
        line();
    }
}

tokenizerTest();
parserTest();