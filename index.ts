// ./index.ts

import { inspect, type InspectOptions } from 'node:util';
import { Tokenizer } from './src/Tokenizer.ts';
import { Parser } from './src/Parser.ts';
import { CharacterStream } from './src/Character.ts';

const OLD_inspectOptions: InspectOptions = {
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

const test = 'rgb(255, 0, 0)';

const stream = new CharacterStream(test);

for (const ch of stream) {
    console.log('CHAR:', inspect(ch, inspectOptions));
}

const old_old_test = () => {
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
        .withLogging('TEST (3): Direct Tokenization from CSS Color String')
        .tokenizeString('rgba(100 128 255 / 0.5)');

    // Test 4
    tokenizer
        .withLogging('TEST (4): Direct Tokenization from CSS Color String')
        .tokenizeString('rgba(100% 360 220  / 50%)');

    // Test 5
    tokenizer
        .withLogging('TEST (5): Direct Tokenization from Hex Color String')
        .tokenizeString('#ff00ff00');
}

////old_test();