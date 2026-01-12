// ./index.ts

import { inspect, styleText, type InspectOptions } from 'node:util';
import type { Token } from './src/types/Tokenizer.types.ts';
import { Tokenizer } from './src/Tokenizer.ts';
import { Parser } from './src/Parser.ts';
import { CharacterStream } from './src/Character/CharacterStream.ts';
import { BoxText, CenteredText, PrintLine } from './src/Logging.ts';
import { VisitorGenerator } from './src/Visitor';
import { Align, BoxType, LineType } from './src/types/Logging.types.ts';

/**
 * @TODO Add character, token, and state support for quotes
 */

const inspectOptions: InspectOptions = {
    showHidden: false,
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

// TEST CASES
// Commented out cases are not working
const testCases: string[] = [
    // '"67 a, b, c / 1 \'word\' 2 3+(2-0)"',
    // '67 a, b, c / 1 word 2 3+(2-0)',
    'rgba(100 128 255 / 0.5)',
    'rgba(100grad 360 220  / 50%)',
    '#ff00ff00',
    '56%',
    '100deg',
    // '1 + 2',
    // '10 - 5 + 3',
    // '2 * 3 + 4',
    // 'rgb(255, 0, 0)',
    // '#ff0000',
    // '100%',
    // '(1 + 2) * 3',
    // '-5 + 10',
    // 'rgba(255, 128, 0, 50%)',
    // 'const a = 10;',

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

const newTestCases: string[] = [
    // Named colors
    'rebeccapurple',
    'aliceblue',

    // RGB Hexadecimal
    '#f09',
    '#ff0099',

    // RGB (Red, Green, Blue)
    'rgb(255 0 153)',
    'rgb(255 0 153 / 80%)',

    // HSL (Hue, Saturation, Lightness)
    'hsl(150 30% 60%)',
    'hsl(150 30% 60% / 80%)',

    // HWB (Hue, Whiteness, Blackness)
    'hwb(12 50% 0%)',
    'hwb(194 0% 0% / 0.5)',

    // Lab (Lightness, A-axis, B-axis)
    'lab(50% 40 59.5)',
    'lab(50% 40 59.5 / 0.5)',

    // LCH (Lightness, Chroma, Hue)
    'lch(52.2% 72.2 50)',
    'lch(52.2% 72.2 50 / 0.5)',

    // Oklab (Lightness, A-axis, B-axis)
    'oklab(59% 0.1 0.1)',
    'oklab(59% 0.1 0.1 / 0.5)',

    // OkLCh (Lightness, Chroma, Hue)
    'oklch(60% 0.15 50)',
    'oklch(60% 0.15 50 / 0.5)',

    /**
     * @TODO Future expansion
     * @description Support relative CSS colors
     */
    //'rgb(from green r g b / 0.5)',
    //'rgb(from #123456 calc(r + 40) calc(g + 40) b)',
    //'rgb(from hwb(120deg 10% 20%) r g calc(b + 200))',
    // HSL hue change
    //'hsl(from red 240deg s l)',
    //'hsl(from green h s l / 0.5)',
    //'hsl(from #123456 h s calc(l + 20))',
    //'hsl(from rgb(200 0 0) calc(h + 30) s calc(l + 30))',
    // HWB alpha channel change
    //'hwb(from green h w b / 0.5)',
    //'hwb(from #123456 h calc(w + 30) b)',
    //'hwb(from lch(40% 70 240deg) h w calc(b - 30))',
    //'lab(from green l a b / 0.5)',
    //'lab(from #123456 calc(l + 10) a b)',
    //'lab(from hsl(180 100% 50%) calc(l - 10) a b)',
    // LCH lightness change
    //'lch(from blue calc(l + 20) c h)',
    //'lch(from green l c h / 0.5)',
    //'lch(from #123456 calc(l + 10) c h)',
    //'lch(from hsl(180 100% 50%) calc(l - 10) c h)',
    //'lch(from var(--color-value) l c h / calc(alpha - 0.1))',
    //'oklab(from green l a b / 0.5)',
    //'oklab(from #123456 calc(l + 0.1) a b / calc(alpha * 0.9))',
    //'oklab(from hsl(180 100% 50%) calc(l - 0.1) a b)',
    //'oklch(from green l c h / 0.5)',
    //'oklch(from #123456 calc(l + 0.1) c h)',
    //'oklch(from hsl(180 100% 50%) calc(l - 0.1) c h)',
    //'oklch(from var(--color) l c h / calc(alpha - 0.1))',
    // light-dark
    //'light-dark(white, black)',
    //'light-dark(rgb(255 255 255), rgb(0 0 0))',
    // Polar color space
    //'color-mix(in hsl, hsl(200 50 80), coral)',
    //'color-mix(in hsl, hsl(200 50 80) 20%, coral 80%)',

    // Rectangular color space
    //'color-mix(in srgb, plum, #123456)',
    //'color-mix(in lab, plum 60%, #123456 50%)',

    // With hue interpolation method
    //'color-mix(in lch increasing hue, hsl(200deg 50% 80%), coral)',
    //'color-mix(in lch longer hue, hsl(200deg 50% 80%) 44%, coral 16%)',
];

const characterStreamTest = () => {
    for (const test of testCases) {
        const stream = new CharacterStream();
        stream
            .set(test)
            .withLogging(undefined, inspectOptions.breakLength);

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
            .withLogging(`TEST (${test}): Direct Tokenization`, inspectOptions.breakLength)
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
    for (const input of newTestCases) {
        // Step 1: Character stream
        const stream = new CharacterStream(input);

        // Step 1: Tokenize
        const tokenizer = new Tokenizer();
        const tokens = tokenizer
            .withoutLogging() //`PARSER TEST`, inspectOptions.breakLength)
            .tokenize(stream);

        // Step 2: Parse
        const parser = new Parser(tokens);
        const ast = parser.parse();
        
        // Step 3: Console log the AST
        PrintLine({ 
            preNewLine: true, 
            postNewLine: true, 
            width: inspectOptions.breakLength, 
            color: 'cyan',
            text: 'ABSTRACT SYNTAX TREE',
            textColor: ['magenta', 'bold' ]
        });
        const styledSource = styleText('redBright', 'SOURCE:\t') + styleText(['yellow', 'bold'], `'${input}'`)
        CenteredText(styledSource);
        PrintLine({ preNewLine: true, postNewLine: true, lineType: LineType.dashed, color: ['gray', 'dim'] })
        parser.debug(ast);
        PrintLine({ preNewLine: true, width: inspectOptions.breakLength, color: 'cyan' });
    }
}
/**
 * EXECUTE TESTS
 */

//characterStreamTest();

//tokenizerTest();
//tokenizerCommentsTest();

parserTest();



/*

type ColorInput = 
    | { a: number; b: number; g: number; r: number } 
    | [number, number, number] 
    | [number, number, number, number] 
    | Uint8Array<ArrayBuffer> 
    | Uint8ClampedArray<ArrayBuffer> 
    | Float32Array 
    | Float64Array 
    | string 
    | number 
    | { toString(): string }

type ColorOutput =
    | 'number' | 'hex' | 'ansi' | 'ansi-16' 
    | 'ansi-16m' | 'ansi-256' | 'css' 
    | 'HEX' | 'hsl' | 'lab' | 'rgb' | 'rgba'

    Valid inputs for color

*/