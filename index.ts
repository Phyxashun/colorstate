// ./index.ts

import { inspect, type InspectOptions } from 'node:util';
import { Tokenizer } from './src/Tokenizer.ts';
import { Parser } from './src/Parser.ts';
import Character from './src/Character.ts';

/**
 * @TODO Add character, token, and state support for quotes
 */

const compactInspectOptions: InspectOptions = {
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

const line = (newLine: boolean = true, width: number = 80): void => {
    if (newLine) console.log(`${'─'.repeat(width)}\n`);
    if (!newLine) console.log(`${'─'.repeat(width)}`);
}

// TEST CASES
// Commented out cases are not working
const testCases: string[] = [
    // Test 0
    `"67 a, b, c / 1 'word' 2 3+(2-0)"`,

    // Test 1
    '67 a, b, c / 1 word 2 3+(2-0)',

    // Test 2
    'rgba(100 128 255 / 0.5)',

    // Test 3
    'rgba(100grad 360 220  / 50%)',

    // Test 4
    '#ff00ff00',

    // Test 5
    '56%',

    // Test 6
    '100grad',

    // Test 7
    '1 + 2',

    // Test 8
    '10 - 5 + 3',

    // Test 9
    '2 * 3 + 4',

    // Test 10
    'rgb(255, 0, 0)',

    // Test 11
    '#ff0000',

    // Test 12
    '50%',

    // Test 13
    '(1 + 2) * 3',

    // Test 14
    '-5 + 10',

    // Test 15
    'rgba(255, 128, 0, 50%)',

    // Test 16
    'const a = 10;',

    // Big Test
    // `const characterStreamTest = () => {
    // line();
    // console.log('=== CHARACTERSTREAM DEMO ===');
    // line();

    // const input = 'rgb(255, 100, 75)';

    // const stream = new CharacterStream(input);

    // console.log('INPUT:');
    // console.log('RESULT OF CHARACTERSTREAM:');
    // for (const char of stream) {
    //     console.log(inspect(char, compactInspectOptions));
    // }
    // console.log();
    // line();
    // }`,
];

const characterStreamTest = (str?: string) => {
    line();
    console.log('=== CHARACTERSTREAM DEMO ===\n');
    line();

    const input = str || 'rgb(255, 100, 75)';
    const stream = new Character.Stream(input);

    console.log(`INPUT: '${input}'\n`);
    console.log('RESULT OF CHARACTERSTREAM:\n');

    for (const char of stream) {
        console.log('\t', inspect(char, compactInspectOptions));
    }

    console.log();
    line();
}

const tokenizerTest = () => {
    // Fluent usage
    const tokenizer = new Tokenizer();
    const stream = new Character.Stream();

    // Test 0
    stream.set(testCases[0]);
    tokenizer
        .withLogging('TEST (0): Direct Tokenization of embedded String')
        .tokenize(stream);

    // Test 1
    stream.set(testCases[1]);
    tokenizer
        .withLogging('TEST (1): Direct Tokenization from String')
        .tokenize(stream);

    // Test 2
    stream.set(testCases[2]);
    tokenizer
        .withLogging('TEST (2): Direct Tokenization from CSS Color String')
        .tokenize(stream);

    // Test 3
    stream.set(testCases[3]);
    tokenizer
        .withLogging('TEST (3): Direct Tokenization from CSS Color String')
        .tokenize(stream);

    // Test 4
    stream.set(testCases[4]);
    tokenizer
        .withLogging('TEST (4): Direct Tokenization from Hex Color String')
        .tokenize(stream);

    // Test 5
    stream.set(testCases[5]);
    tokenizer
        .withLogging('TEST (5): Direct Tokenization from percentage')
        .tokenize(stream);

    // Test 6
    stream.set(testCases[6]);
    tokenizer
        .withLogging('TEST (6): Direct Tokenization from units')
        .tokenize(stream);
}

const parserTest = () => {
    console.log('\n=== TOKENIZATION & PARSING DEMO ===\n');

    for (const input of testCases) {
        line();

        // Step 1: Character stream
        const stream = new Character.Stream(input);

        // Step 1: Tokenize
        const tokenizer = new Tokenizer();
        const tokens = tokenizer
            .withLogging(`PARSER TEST:\n\nINPUT:\n\t'${input}'\n${'─'.repeat(80)}`)
            .tokenize(stream);

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

characterStreamTest();
for (const test of testCases) {
    characterStreamTest(test);
}

//tokenizerTest();
//parserTest();
