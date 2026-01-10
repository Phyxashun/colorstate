// ./index.ts

import { inspect, type InspectOptions } from 'node:util';
import type { Token } from './src/types/Tokenizer.types.ts';
import { Tokenizer } from './src/Tokenizer.ts';
import { Parser } from './src/Parser.ts';
import { CharacterStream } from './src/Character/CharacterStream.ts';

/**
 * @TODO Add character, token, and state support for quotes
 */

const line = (newLine: boolean = true, width: number = 80): void => {
    if (newLine) console.log(`${'─'.repeat(width)}\n`);
    if (!newLine) console.log(`${'─'.repeat(width)}`);
}

// TEST CASES
// Commented out cases are not working
const testCases: string[] = [
    '"67 a, b, c / 1 \'word\' 2 3+(2-0)"',
    '67 a, b, c / 1 word 2 3+(2-0)',
    'rgba(100 128 255 / 0.5)',
    'rgba(100grad 360 220  / 50%)',
    '#ff00ff00',
    '56%',
    '100deg',
    '1 + 2',
    '10 - 5 + 3',
    '2 * 3 + 4',
    'rgb(255, 0, 0)',
    '#ff0000',
    '100%',
    '(1 + 2) * 3',
    '-5 + 10',
    'rgba(255, 128, 0, 50%)',
    'const a = 10;',

    // Big Test

    // `const characterStreamTest = () => {
    //     line();
    //     console.log('=== CHARACTERSTREAM DEMO ===');
    //     line();
    //     const input = 'rgb(255, 100, 75)';
    //     const stream = new CharacterStream(input);
    //     console.log('INPUT:');
    //     console.log('RESULT OF CHARACTERSTREAM:');
    //     for (const char of stream) {
    //         console.log(inspect(char, compactInspectOptions));
    //     }
    //     console.log();
    //     line();
    // }`,
];

const characterStreamTest = () => {
    for (const test of testCases) {
        const stream = new CharacterStream();
        stream
            .set(test)
            .withLogging();

        for (const char of stream) {

        }
    }
}

const tokenizerTest = () => {
    // Fluent usage
    const tokenizer = new Tokenizer();

    for (const test in testCases) {
        const stream = new CharacterStream(testCases[test]);
        tokenizer
            .withLogging(`TEST (${test}): Direct Tokenization`)
            .tokenize(stream);
    }
}

const tokenizerCommentsTest = () => {
    const testCode = [
        `let name = "John Doe\\n"; // A comment\nconst value = 123.45;`,
        'let x = 1; // Comment with a \\ backslash',
        '/* Comment */ let name = "Jane Doe"; // Another comment\nconst pay = 750.00;'
    ];

    for (const test of testCode) {
        // 1. Create a stream from the source
        const stream = new CharacterStream(test);

        // 2. Create a tokenizer instance
        const tokenizer = new Tokenizer();

        // 3. Generate tokens
        const tokens: Token[] = tokenizer
            .withLogging()
            .tokenize(stream);
    }
}

const parserTest = () => {
    const inspectOptions: InspectOptions = {
        showHidden: true,
        depth: null,
        colors: true,
        customInspect: false,
        showProxy: false,
        maxArrayLength: null,
        maxStringLength: null,
        breakLength: 80,
        compact: false,
        sorted: false,
        getters: false,
        numericSeparator: true,
    };

    console.log('\n=== TOKENIZATION & PARSING DEMO ===\n');

    for (const input of testCases) {
        line();

        // Step 1: Character stream
        const stream = new CharacterStream(input);

        // Step 1: Tokenize
        const tokenizer = new Tokenizer();
        const tokens = tokenizer
            .withoutLogging() //(`PARSER TEST:\n\nINPUT:\n\t'${input}'\n${'─'.repeat(80)}`)
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
/**
 * EXECUTE TESTS
 */

//characterStreamTest();

//tokenizerTest();
//tokenizerCommentsTest();

parserTest();