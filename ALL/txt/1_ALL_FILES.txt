

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: Consolidate.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// ./Consolidate.ts

/**
 * @file Consolidate.ts
 * @description A utility script to consolidate project files into single, 
 *              combined output files. The script is organized into logical 
 *              namespaces:
 *              - `config`: Defines the consolidation jobs.
 *              - `ui`: Handles all console output and user interface elements.
 *              - `fileSystem`: Provides low-level functions for file system interactions.
 *              - `consolidator`: Orchestrates the consolidation process using the other namespaces.
 * @copyright 2026 Dustin Dew
 * @license MIT
 * @author Dustin Dew <phyxashun@gmail.com>
 */

import { styleText } from 'node:util';
import figlet from 'figlet';
import standard from "figlet/fonts/Standard";
import * as fs from 'node:fs';
import { globSync } from 'glob';

const TEXT_OUTPUT_DIR = './ALL/txt/';
const TS_OUTPUT_DIR = './ALL/ts/'; 

/**
 * @namespace Consolidator
 * @description Orchestrates the file consolidation process
 */
namespace Consolidator {
    /**
     * Constants
     */
    const MAX_WIDTH: number = 80;
    const FIGLET_FONT = 'Standard';
    figlet.parseFont(FIGLET_FONT, standard);
    const LINE_CHAR = '█';
    const TAB_WIDTH = 4;
    const SPACE = ' ';
    const START_END_SPACER = 30;
    const START_END_NEWLINE = 2;
    const UTF_8 = 'utf-8';

    /**
     * @interface ConsolidationJob
     * @description Defines the structure for a single consolidation task.
     * @property {string} name - A descriptive name for the job, used in logging.
     * @property {string} outputFile - The path to the file where content will be consolidated.
     * @property {string[]} patterns - An array of glob patterns to find files for this job.
     */
    interface ConsolidationJob {
        name: string;
        outputFile: string;
        patterns: string[];
    }

    /**
     * @interface PrintLineOptions
     * @description Defines the structure for a printLine options object.
     * @property {boolean} preNewLine - If true, adds a newline before the divider.
     * @property {boolean} postNewLine - If true, adds a newline after the divider.
     * @property {number} width - The width of the line.
     * @property {string} char - The character to use for the line.
     */
    interface PrintLineOptions {
        preNewLine?: boolean;
        postNewLine?: boolean;
        width?: number;
        char?: string;
    }

    /**
     * @description An array of all consolidation jobs to be executed by the script.
     * @type {ConsolidationJob[]}
     */
    const JOBS: ConsolidationJob[] = [
        // Main project source files
        {
            name: styleText(['red', 'underline'], 'Typescript'),
            outputFile: TS_OUTPUT_DIR + '1_ALL_FILES.ts',
            patterns: [
                'Consolidate.ts',
                'index.ts',
                'src/**/*.ts',
                'src/**/*.js'
            ],
        },
        // Project configuration files
        {
            name: styleText(['red', 'underline'], 'Configuration'),
            outputFile: TS_OUTPUT_DIR + '2_ALL_CONFIGS.ts',
            patterns: [
                '.vscode/launch.json',
                '0. NOTES/*.md',
                '.gitignore',
                '*.json',
                '*.config.ts',
                '*.config.js',
                'License',
                'README.md',
            ],
        },
        // All test files
        {
            name: styleText(['red', 'underline'], 'Test'),
            outputFile: TS_OUTPUT_DIR + '3_ALL_TESTS.ts',
            patterns: [
                'test/**/*.test.ts',
                'test/**/*.test.js'
            ],
        },
        // All old files
        {
            name: styleText(['red', 'underline'], 'Test'),
            outputFile: TS_OUTPUT_DIR + '4_ALL_OLD_FILES.ts',
            patterns: [
                'test_old/**/*.test.ts',
                'test_old/**/*.test.js'
            ],
        },

        /********************************************************************************
         * 
         * CREATE TEXT FILES FOR EASY SHARING
         * 
         ********************************************************************************/

        // Main project source files
        {
            name: styleText(['red', 'underline'], 'Typescript'),
            outputFile: TEXT_OUTPUT_DIR + '1_ALL_FILES.txt',
            patterns: [
                'Consolidate.ts',
                'index.ts',
                'src/**/*.ts',
                'src/**/*.js'
            ],
        },
        // Project configuration files
        {
            name: styleText(['red', 'underline'], 'Configuration'),
            outputFile: TEXT_OUTPUT_DIR + '2_ALL_CONFIGS.txt',
            patterns: [
                '.vscode/launch.json',
                '0. NOTES/*.md',
                '.gitignore',
                '*.json',
                '*.config.ts',
                '*.config.js',
                'License',
                'README.md',
            ],
        },
        // All test files
        {
            name: styleText(['red', 'underline'], 'Test'),
            outputFile: TEXT_OUTPUT_DIR + '3_ALL_TESTS.txt',
            patterns: [
                'test/**/*.test.ts',
                'test/**/*.test.js'
            ],
        },
        // All old files
        {
            name: styleText(['red', 'underline'], 'Test'),
            outputFile: TEXT_OUTPUT_DIR + '4_ALL_OLD_FILES.txt',
            patterns: [
                'test_old/**/*.test.ts',
                'test_old/**/*.test.js'
            ],
        },
    ];

    /**
     * @description Default options object for the printLine function.
     */
    const defaultPrintLineOptions: PrintLineOptions = {
        preNewLine: false,  // No preceding new line
        postNewLine: false, // No successive new line
        width: MAX_WIDTH,   // Use global const MAX_WIDTH = 80
        char: LINE_CHAR,    // Use global const LINE_CHAR = '='          
    };

    /**
     * @function printLine
     * @description Prints a styled horizontal line to the console.
     * @param {PrintLineOptions} [options={}] - Configuration options for the line.
     * @returns {void}
     */
    const printLine = (options: PrintLineOptions = {}): void => {
        const { preNewLine, postNewLine, width, char } = {
            ...defaultPrintLineOptions,
            ...options
        };
        const pre = preNewLine ? '\n' : '';
        const post = postNewLine ? '\n' : '';
        const styledDivider = styleText(['gray', 'bold'], char!.repeat(width!));
        console.log(`${pre}${styledDivider}${post}`);
    };

    /**
     * @function spacer
     * @description Creates a string of repeated characters, useful for padding.
     * @param {number} [width=TAB_WIDTH] - Number of characters to repeat.
     * @param {string} [char=SPACE] - The character to repeat.
     * @returns {string} A string of repeated characters.
     */
    const spacer = (width: number = TAB_WIDTH, char: string = SPACE): string => char.repeat(width);

    /**
     * @function centerText
     * @description Centers a line of text within a given width by adding padding.
     * @param {string} text - The text to center.
     * @param {number} [width=MAX_WIDTH] - The total width to center within.
     * @returns {string} The centered text string.
     * @requires spacer - Function that return a string for spacing.
     */
    const centerText = (text: string, width: number = MAX_WIDTH): string => {
        // Remove any existing styling for accurate length calculation
        const unstyledText = text.replace(/\x1b\[[0-9;]*m/g, '');
        const padding = Math.max(0, Math.floor((width - unstyledText.length) / 2));
        return `${spacer(padding)}${text}`;
    };

    /**
     * @function centeredFiglet
     * @description Generates and centers multi-line FIGlet (ASCII) text.
     * @param {string} text - The text to convert to ASCII art.
     * @param {number} [width=MAX_WIDTH] - The total width to center the art within.
     * @returns {string} The centered, multi-line ASCII art as a single string.
     * @requires centerText
     */
    const centeredFiglet = (text: string, width: number = MAX_WIDTH): string => {
        const rawFiglet = figlet.textSync(text, {
            font: FIGLET_FONT,
            width: width,
            whitespaceBreak: true
        });

        return rawFiglet.split('\n')
            .map(line => centerText(line, width))
            .join('\n');
    }

    /**
     * @function displayHeader
     * @description Renders the main application header, including title and subtitle.
     * @returns {void}
     * @requires printLine
     * @requires centeredFiglet
     * @requires styleText
     * @requires centerText
     */
    const displayHeader = async (): Promise<void> => {
        printLine({ preNewLine: true });
        console.log(styleText(['yellowBright', 'bold'], centeredFiglet(`Consolidate!!!`)));
        console.log(centerText(styleText(['magentaBright', 'bold'], '*** PROJECT FILE CONSOLIDATOR SCRIPT ***')));
        printLine({ preNewLine: true, postNewLine: true });
    };

    /**
     * Logs the start of a new consolidation job.
     * @param {string} jobName - The name of the job being processed.
     * @param {string} outputFile - The path of the output file for the job.
     */
    const logJobStart = (jobName: string, outputFile: string): void => {
        const styledJob = styleText('cyan', `Consolidating all project ${jobName} files into`)
        console.log(styledJob, `${outputFile}...\n`);
    };

    /**
     * Logs the path of a file being appended to an output file.
     * @param {string} filePath - The path of the file being appended.
     */
    const logFileAppend = (filePath: string): void => {
        console.log(styleText('blue', `\tAppending:`), `${filePath}`);
    };

    /**
     * Logs a successful completion message for a job.
     */
    const logComplete = (): void => {
        console.log(styleText(['green', 'bold'], '\nConsolidation complete!!!'));
        printLine({ preNewLine: true, postNewLine: true });
    };

    /**
     * Ensures an output file is empty by deleting it if it already exists.
     * @param {string} filePath - The path to the output file to prepare.
     */
    const prepareOutputFile = (filePath: string): void => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    };

    /**
     * Finds all file paths matching an array of glob patterns.
     * @param {string[]} patterns - The glob patterns to search for.
     * @param {string} outputFile - The path of the output file, to be excluded from the search.
     * @returns {string[]} An array of found file paths.
     */
    const findFiles = (patterns: string[], outputFile: string): string[] => {
        return globSync(
            patterns,
            {
                ignore: [
                    'coverage/**',
                    'node_modules/**',
                    'ALL/**',
                    outputFile
                ]
            }
        );
    };

    /**
     * Appends the content of a source file to an output file, wrapped with header and footer comments.
     * @param {string} outputFile - The path to the destination file.
     * @param {string} sourceFile - The path of the source file to append.
     */
    const appendFileWithHeaders = (outputFile: string, sourceFile: string): void => {
        const space = spacer(START_END_SPACER, '■');
        const endLine = spacer(START_END_NEWLINE, '\n')
        const divider = spacer(100, '█');

        const startFile = `${endLine}//${space} Start of file: ${sourceFile} ${space}${endLine}${endLine}\n`;
        const tsNoCheck = `// @ts-nocheck\n`;
        const eslintDisable = `/* eslint-disable */${endLine}`;
        const content = fs.readFileSync(sourceFile, UTF_8);
        const endFile = `\n${endLine}${endLine}//${space} End of file: ${sourceFile} ${space}${endLine}\n`;
        const fileDivider = `//${divider}\n`;

        fs.appendFileSync(outputFile, startFile, UTF_8);
        fs.appendFileSync(outputFile, tsNoCheck, UTF_8);
        fs.appendFileSync(outputFile, eslintDisable, UTF_8);
        fs.appendFileSync(outputFile, content, UTF_8);
        fs.appendFileSync(outputFile, endFile, UTF_8);
        fs.appendFileSync(outputFile, fileDivider, UTF_8);
        fs.appendFileSync(outputFile, fileDivider, UTF_8);
    };

    /**
     * Processes a single consolidation job from start to finish.
     * @param {config.ConsolidationJob} job - The consolidation job to execute.
     * @private
     */
    const processJob = (job: ConsolidationJob): void => {
        const { name, outputFile, patterns } = job;

        logJobStart(name, outputFile);
        prepareOutputFile(outputFile);

        findFiles(patterns, outputFile)
            .forEach(sourceFile => {
                logFileAppend(sourceFile);
                appendFileWithHeaders(outputFile, sourceFile);
            });

        logComplete();
    };

    /**
     * Runs all consolidation jobs defined in the configuration.
     * @param {config.ConsolidationJob[]} jobs - An array of consolidation jobs to execute.
     */
    const run = (jobs: ConsolidationJob[]): void => {
        jobs.forEach(processJob);
    };

    /**
     * @function main
     * @description The main entry point for the script. Initializes the UI and 
     *              starts the consolidation process.
     */
    export const main = (): void => {
        displayHeader();
        run(JOBS);
    };
}

// Executes and exports the script.
export const Consolidate = Consolidator.main;
Consolidate();






//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: Consolidate.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: index.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// ./index.ts

import { inspect, type InspectOptions } from 'node:util';
import { Token, Tokenizer } from './src/Tokenizer.ts';
//import { Parser } from './src/Parser.ts';
import { CharacterStream } from './src/Character.ts';

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
    '"67 a, b, c / 1 \'word\' 2 3+(2-0)"',
    '67 a, b, c / 1 word 2 3+(2-0)',
    'rgba(100 128 255 / 0.5)',
    'rgba(100grad 360 220  / 50%)',
    '#ff00ff00',
    '56%',
    '100grad',
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

const characterStreamTest = () => {
    for (const test of testCases) {
        line();
        console.log('=== CHARACTERSTREAM DEMO ===\n');
        line();

        const stream = new CharacterStream(test);

        console.log(`INPUT: '${test}'\n`);
        console.log('RESULT OF CHARACTERSTREAM:\n');

        for (const char of stream) {
            console.log('\t', inspect(char, compactInspectOptions));
        }

        console.log();
        line();
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

// const parserTest = () => {
//     console.log('\n=== TOKENIZATION & PARSING DEMO ===\n');

//     for (const input of testCases) {
//         line();

//         // Step 1: Character stream
//         const stream = new CharacterStream(input);

//         // Step 1: Tokenize
//         const tokenizer = new Tokenizer();
//         const tokens = tokenizer
//             .withoutLogging() //(`PARSER TEST:\n\nINPUT:\n\t'${input}'\n${'─'.repeat(80)}`)
//             .tokenize(stream);

//         // Step 2: Parse
//         const parser = new Parser(tokens);
//         const ast = parser.parse();

//         // Step 3: Console log the AST
//         console.log('\nAST:\n');
//         const defaultAST = inspect(ast, inspectOptions);
//         const fourSpaceAST = defaultAST.replace(/^ +/gm, match => ' '.repeat(match.length * 2));
//         console.log(fourSpaceAST, '\n');
//         line();
//     }
// }

const newTokenizerTest = () => {
    const sourceCode = `let name = "John Doe\\n"; // A comment\nconst value = 123.45;`;

    // 1. Create a stream from the source
    const stream = new CharacterStream(sourceCode);

    // 2. Create a tokenizer instance
    const tokenizer = new Tokenizer();

    // 3. Generate tokens
    const tokens: Token[] = tokenizer
        .withLogging()
        .tokenize(stream);
}

//characterStreamTest();

tokenizerTest();
//newTokenizerTest();

//parserTest();






//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: index.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/PrintLine.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

import { inspect, styleText, type InspectOptions } from 'node:util';

const MAX_WIDTH: number = 80;

enum Line {
    Default = '─',
    Square = '■',
    Bold = '█',
    Dashed = '-',
    Underscore = '_',
    DoubleUnderscore = '‗',
    Equals = '=',
    Double = '═',
    BoldBottom = '▄',
    BoldTop = '▀',
    Diaeresis = '¨',
    Macron = '¯',
    Section = '§',
    Interpunct = '·',
    LightBlock = '░',
    MediumBlock = '▒',
    HeavyBlock = '▓',
};

/**
 * @interface PrintLineOptions
 * @description Defines the structure for a printLine options object.
 * @property {boolean} preNewLine - If true, adds a newline before the divider.
 * @property {boolean} postNewLine - If true, adds a newline after the divider.
 * @property {number} width - The width of the line.
 * @property {string} line - The character to use for the line.
 */
interface DividerOptions {
    preNewLine?: boolean;
    postNewLine?: boolean;
    width?: number;
    line?: Line;
}

/**
 * @class Divider
 * @description Prints a styled horizontal line to the console.
 * @param {DividerOptions} [options={}] - Configuration options for the line.
 * @returns {void}
 */
class Divider {
    static #instance: Divider;

    private readonly inspectOptions: InspectOptions = {
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

    /**
     * @description Default options object for the printLine function.
     */
    private readonly defaultOptions: DividerOptions = {
        preNewLine: false,      // No preceding new line
        postNewLine: false,     // No successive new line
        width: MAX_WIDTH,       // Use global const MAX_WIDTH = 80
        line: Line.Double,      // Use global const LINE_CHAR = '='          
    };

    // @ts-expect-error
    private options: DividerOptions;
    // @ts-expect-error
    private pre: string;
    // @ts-expect-error
    private post: string;
    // @ts-expect-error
    private divider: string;

    private constructor() {}

    public static get instance(): Divider {
        if (!this.#instance) {
            this.#instance = new Divider();
        }
        return this.#instance;
    }

    public init(options: DividerOptions = {}) {
        this.options = {
            ...this.defaultOptions,
            ...options
        };

        this.pre = this.options.preNewLine ? '\n' : '';
        this.post = this.options.postNewLine ? '\n' : '';
        this.divider = styleText(['gray', 'bold'], this.options.line!.repeat(this.options.width!));
    }

    public toString(): string {
        return `${this.pre}${this.divider}${this.post}`
    }

    public log = (): void => {
        console.log(this.toString());
    }

} // End class PrintLine

// Exports
const PrintLine = (options: DividerOptions = {}): void => {
    const dividerInstance = Divider.instance;
    dividerInstance.init(options);
    dividerInstance.log();
}

export default PrintLine;

export {
    MAX_WIDTH,
    type DividerOptions,
    Divider,
    Line
}




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/PrintLine.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Character.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/Character.ts

/**
 * The Char namespace encapsulates all character and stream-related logic.
 */
//namespace Char {

/**
 * Represents a specific location within the source string, tracked by index,
 * line number, and column number.
 */
export interface Position {
    /** The zero-based index of the character in the overall string. */
    index: number;
    /** The one-based line number where the character appears. */
    line: number;
    /** The one-based column number of the character on its line. */
    column: number;
}

/**
 * Represents a single character processed from the stream, containing its
 * value, classified type, and original position.
 */
export interface Character {
    /** The string value of the character. May be multi-byte. */
    value: string;
    /** The type of the character, as classified by the CharUtility class. */
    type: CharType;
    /** The position of the character in the source string. */
    position: Position;
}

/**
 * A detailed enumeration of all possible character types recognized by the classifier.
 * This includes stream control types, general categories, and specific, common symbols.
 */
export enum CharType {
    // CharacterStream Control
    EOF = 'EOF',
    Error = 'Error',
    Other = 'Other',

    // Whitespace & Formatting
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',

    // Primary Literals
    Letter = 'Letter',
    Number = 'Number',
    Hex = 'Hex',

    // Quotes & Strings
    SingleQuote = 'SingleQuote',
    DoubleQuote = 'DoubleQuote',
    Backtick = 'Backtick',

    // Brackets & Enclosures
    LParen = 'LParen',
    RParen = 'RParen',
    LBracket = 'LBracket',
    RBracket = 'RBracket',
    LBrace = 'LBrace',
    RBrace = 'RBrace',

    // Common Operators & Mathematical
    Plus = 'Plus',
    Minus = 'Minus',
    Star = 'Star',
    Slash = 'Slash',
    BackSlash = 'BackSlash',
    EqualSign = 'EqualSign',
    Percent = 'Percent',
    Caret = 'Caret',
    Tilde = 'Tilde',
    Pipe = 'Pipe',
    LessThan = 'LessThan',
    GreaterThan = 'GreaterThan',

    // Punctuation & Delimiters
    Dot = 'Dot',
    Comma = 'Comma',
    Colon = 'Colon',
    SemiColon = 'SemiColon',
    Exclamation = 'Exclamation',
    Question = 'Question',
    Punctuation = 'Punctuation',

    // Special Symbols & Identifiers
    Hash = 'Hash',
    At = 'At',
    Ampersand = 'Ampersand',
    Dollar = 'Dollar',
    Underscore = 'Underscore',
    Currency = 'Currency',
    Symbol = 'Symbol',

    // International / Multi-byte
    Emoji = 'Emoji',
    Unicode = 'Unicode',
} // End enum CharType

/**
 * A stateless CharUtility class for classifying characters.
 */
export class CharUtility {

    /**
     * An ordered list of regular expression rules used as a fallback mechanism
     * for characters not found in the `SymbolMap`. The order is critical for
     * correct classification, testing for more specific categories (like Emoji)
     * before more general ones (like Symbol).
     */
    private static readonly RegexMap: [CharType, (char: string) => boolean][] = [
        /**
         ** ASCII Whitespace Checks
         */
        [CharType.NewLine, (char: string) => /[\n\r]/.test(char)],
        [CharType.Whitespace, (char: string) => /^\s+$/.test(char)],

        /**
         * UNICODE LETTERS
         * 
         ** L	Letter (includes):
         *      Lu	Uppercase Letter
         *      Ll	Lowercase Letter
         *      Lt	Titlecase Letter
         *      Lm	Modifier Letter
         *      Lo	Other Letter
         */
        [CharType.Letter, (char: string) => /\p{L}/u.test(char)],

        /**
         * UNICODE NUMBERS
         * 
         ** N	Number (includes):
         *      Nd	Decimal Digit Number
         *      Nl	Letter Number
         *      No	Other Number
         */
        [CharType.Number, (char: string) => /\p{N}/u.test(char)],

        [CharType.Emoji, (char: string) => /\p{Emoji_Presentation}/v.test(char)],
        [CharType.Currency, (char: string) => /\p{Sc}/u.test(char)],
        [CharType.Punctuation, (char: string) => /\p{P}/u.test(char)],

        /**
         * UNICODE SYMBOLS
         * 
         ** S	Symbol (includes):
         *      Sm	Math Symbol
         *      Sc	Currency Symbol
         *      Sk	Modifier Symbol
         *      So	Other Symbol
         */
        [CharType.Symbol, (char: string) => /\p{S}/u.test(char)],

        /**
         * UNICODE
         * 
         ** ASCII (includes):
         *      all ASCII characters ([\u{0}-\u{7F}])
         */
        [CharType.Unicode, (char: string) => /\P{ASCII}/u.test(char)],

        /**
         * UNICODE
         * 
         * Not Currently, Directly Implemented:
         * 
         ** M	Mark (includes):
         *      Mn	Non-Spacing Mark
         *      Mc	Spacing Combining Mark
         *      Me	Enclosing Mark
         * 
         ** P	Punctuation (includes):
         *      Pc	Connector Punctuation
         *      Pd	Dash Punctuation
         *      Ps	Open Punctuation
         *      Pe	Close Punctuation
         *      Pi	Initial Punctuation
         *      Pf	Final Punctuation
         *      Po	Other Punctuation
         * 
         ** Z	Separator (includes):
         *      Zs	Space Separator
         *      Zl	Line Separator
         *      Zp	Paragraph Separator
         * 
         ** C	Other (includes):
         *      Cc	Control
         *      Cf	Format
         *      Cs	Surrogate
         *      Co	Private Use
         *      Cn	Unassigned
         **      -	*Any
         **      -	*Assigned
         **      -	*ASCII (implemented above)
         * 
         ** *Any (includes):
         *      all code points ([\u{0}-\u{10FFFF}])
         * 
         ** *Assigned (includes):
         *      all assigned characters (\P{Cn})
         */

        /**
         * OTHER UNICODE CHARACTER PROPERTIES TO CONSIDER:
         * 
         *      GENERAL	                        CASE	                        SHAPING AND RENDERING
         *      Name (Name_Alias)	            Uppercase	                    Join_Control
         *      Block	                        Lowercase	                    Joining_Group
         *      Age	                            Simple_Lowercase_Mapping	    Joining_CharType
         *      General_Category	            Simple_Titlecase_Mapping	    Vertical_Orientation
         *      Script (Script_Extensions)	    Simple_Uppercase_Mapping	    Line_Break
         *      White_Space	                    Simple_Case_Folding	            Grapheme_Cluster_Break
         *      Alphabetic	                    Soft_Dotted	                    Sentence_Break
         *      Hangul_Syllable_CharType	        Cased	                        Word_Break
         *      Noncharacter_Code_Point	        Case_Ignorable	                East_Asian_Width
         *      Default_Ignorable_Code_Point	Changes_When_Lowercased	        Prepended_Concatenation_Mark
         *      Deprecated	                    Changes_When_Uppercased	 
         *      Logical_Order_Exception	        Changes_When_Titlecased	        BIDIRECTIONAL
         *      Variation_Selector	            Changes_When_Casefolded	        Bidi_Class
         *                                      Changes_When_Casemapped	        Bidi_Control
         *      NUMERIC	 	                                                    Bidi_Mirrored
         *      Numeric_Value	                NORMALIZATION	                Bidi_Mirroring_Glyph
         *      Numeric_CharType	                Canonical_Combining_Class	    Bidi_Paired_Bracket
         *      Hex_Digit	                    Decomposition_CharType	            Bidi_Paired_Bracket_CharType
         *      ASCII_Hex_Digit	                NFC_Quick_Check	 
         *                                      NFKC_Quick_Check	            MISCELLANEOUS
         *      IDENTIFIERS	                    NFD_Quick_Check	                Math
         *      ID_Continue	                    NFKD_Quick_Check	            Quotation_Mark
         *      ID_Start	                    NFKC_Casefold	                Dash
         *      XID_Continue	                Changes_When_NFKC_Casefolded	Sentence_Terminal
         *      XID_Start	 	                                                Terminal_Punctuation
         *      Pattern_Syntax	                EMOJI	                        Diacritic
         *      Pattern_White_Space	            Emoji	                        Extender
         *      Identifier_Status	            Emoji_Presentation	            Grapheme_Base
         *      Identifier_CharType	                Emoji_Modifier	                Grapheme_Extend
         *                                      Emoji_Modifier_Base	            Regional_Indicator
         *      CJK	                            Emoji_Component	 
         *      Ideographic	                    Extended_Pictographic	 
         *      Unified_Ideograph	            Basic_Emoji*	 
         *      Radical	                        Emoji_Keycap_Sequence*	 
         *      IDS_Binary_Operator	            RGI_Emoji_Modifier_Sequence*	 
         *      IDS_Trinary_Operator	        RGI_Emoji_Flag_Sequence*	 
         *      Equivalent_Unified_Ideograph	RGI_Emoji_Tag_Sequence*	 
         *      RGI_Emoji_ZWJ_Sequence*	 
         *      RGI_Emoji*	 
         */

        /**
         ** Table 12. General_Category Values
         * 
         *      ABBR    LONG	                    DESCRIPTION
         *--------------------------------------------------------------------------------------------------------------
         *      Lu  	Uppercase_Letter	        an uppercase letter
         *      Ll  	Lowercase_Letter	        a lowercase letter
         *      Lt  	Titlecase_Letter	        a digraph encoded as a single character, with first part uppercase
         *      LC  	Cased_Letter	            Lu | Ll | Lt
         *      Lm  	Modifier_Letter	            a modifier letter
         *      Lo  	Other_Letter	            other letters, including syllables and ideographs
         *      L   	Letter	                    Lu | Ll | Lt | Lm | Lo
         *      Mn  	Nonspacing_Mark	            a nonspacing combining mark (zero advance width)
         *      Mc  	Spacing_Mark	            a spacing combining mark (positive advance width)
         *      Me  	Enclosing_Mark	            an enclosing combining mark
         *      M   	Mark	                    Mn | Mc | Me
         *      Nd  	Decimal_Number	            a decimal digit
         *      Nl  	Letter_Number	            a letterlike numeric character
         *      No  	Other_Number	            a numeric character of other type
         *      N   	Number	                    Nd | Nl | No
         *      Pc  	Connector_Punctuation       a connecting punctuation mark, like a tie
         *      Pd  	Dash_Punctuation	        a dash or hyphen punctuation mark
         *      Ps  	Open_Punctuation	        an opening punctuation mark (of a pair)
         *      Pe  	Close_Punctuation	        a closing punctuation mark (of a pair)
         *      Pi  	Initial_Punctuation	        an initial quotation mark
         *      Pf  	Final_Punctuation	        a final quotation mark
         *      Po  	Other_Punctuation	        a punctuation mark of other type
         *      P   	Punctuation	                Pc | Pd | Ps | Pe | Pi | Pf | Po
         *      Sm  	Math_Symbol	                a symbol of mathematical use
         *      Sc  	Currency_Symbol	            a currency sign
         *      Sk  	Modifier_Symbol	            a non-letterlike modifier symbol
         *      So  	Other_Symbol	            a symbol of other type
         *      S   	Symbol	                    Sm | Sc | Sk | So
         *      Zs  	Space_Separator	            a space character (of various non-zero widths)
         *      Zl  	Line_Separator	            U+2028 LINE SEPARATOR only
         *      Zp  	Paragraph_Separator	        U+2029 PARAGRAPH SEPARATOR only
         *      Z   	Separator	                Zs | Zl | Zp
         *      Cc  	Control	                    a C0 or C1 control code
         *      Cf  	Format	                    a format control character
         *      Cs  	Surrogate	                a surrogate code point
         *      Co  	Private_Use	                a private-use character
         *      Cn  	Unassigned	                a reserved unassigned code point or a noncharacter
         *      C   	Other	                    Cc | Cf | Cs | Co | Cn
         */
    ];

    /**
     * A map of common single characters to their specific types.
     * This provides an O(1) fast-path lookup, avoiding more expensive
     * regex checks for the most frequent ASCII symbols.
     */
    private static readonly SymbolMap: Record<string, CharType> = {
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
     * Classifies a character using a multi-step, stateless process.
     * The algorithm is:
     * 1. Handle stream control cases (EOF, null).
     * 2. Attempt a fast O(1) lookup in `SymbolMap`.
     * 3. If not found, iterate through the ordered `RegexMap`.
     * 4. If no rule matches, return a fallback `CharType`.
     * @param char The character string to classify.
     * @returns The classified `CharType` of the character.
     */
    public static classify(char: string): CharType {
        // 1. Handle EOF, undefined and null
        if (char === '') return this.handleEOF();
        if (char === undefined || char === null) return this.handleError(char);
        // 2. Handle characters in the symbol map (fast path)
        if (this.SymbolMap[char]) return this.SymbolMap[char];
        // 3. Loop through the ordered classification rules (fallback).
        for (const [type, predicate] of this.RegexMap) {
            if (predicate(char)) return type;
        }
        // 4. Fallback type
        return this.handleOther(char);
    }

    /** Private helper for handling the 'Other' case. Can be expanded for custom logic. */
    private static handleOther(char: string): CharType {
        return CharType.Other;
    }

    /** Private helper for handling the 'Error' case. Can be expanded for custom logic. */
    private static handleError(char: string): CharType {
        return CharType.Error;
    }

    /** Private helper for handling the 'EOF' case. */
    private static handleEOF(): CharType {
        return CharType.EOF;
    }
} // End class CharUtility

/**
 * Provides a stateful, iterable stream of `Character` objects from a source string.
 * It supports Unicode, peeking, backtracking, and speculative parsing via marks.
 */
export class CharacterStream implements IterableIterator<Character> {
    // The Unicode-normalized (NFC) source string being processed.
    private source: string = ''.normalize('NFC');
    // The current byte index of the cursor in the source string.
    private index: number = 0;
    // The current 1-based line number of the cursor.
    private line: number = 1;
    // The current 1-based column number of the cursor.
    private column: number = 1;

    /**
     * A buffer of all previously processed `Character` objects. This serves as the
     * stream's history, enabling backtracking (`back()`) and lookbehind (`lookbackWhile()`).
     * Using the full `Character` object is a design choice to retain type and
     * position info, not just the raw value.
     */
    public charsBuffer: Character[] = [];

    /** 
     * A stack storing the lengths of `charsBuffer` at points where `mark()` was called. 
     */
    private marks: number[] = [];

    /**
     * Initializes a new character stream.
     * @param {string} [input] - The optional initial source string. It will be normalized to NFC.
     */
    constructor(input?: string) {
        this.source = (input || '').normalize('NFC');
        this.index = 0;
        this.line = 1;
        this.column = 1;
        this.charsBuffer = [];
        this.marks = [];
        return this;
    }

    /**
     * Gets the current source string of the stream.
     * @returns {string} The source string.
     */
    public get(): string {
        return this.source;
    }

    /**
     * Replaces the stream's source and resets its entire state (position, buffers, marks)
     * to their initial values.
     * @param {string} input - The new source string.
     */
    public set(input?: string): CharacterStream {
        this.source = (input || '').normalize('NFC');
        this.index = 0;
        this.line = 1;
        this.column = 1;
        this.charsBuffer = [];
        this.marks = [];
        return this;
    }

    /**
     * Gets the current stream position.
     * @returns {Position} An object containing the current index, line, and column.
     */
    public getPosition(): Position {
        return {
            index: this.index,
            line: this.line,
            column: this.column,
        };
    }

    /**
     * Manually sets the stream's cursor to a specific position.
     * @param {number} index - The character index.
     * @param {number} line - The line number.
     * @param {number} column - The column number.
     */
    public setPosition(index: number, line: number, column: number): void;
    /**
     * Manually sets the stream's cursor to a specific position using a Position object.
     * @param {Position} position - The Position object to apply.
     */
    public setPosition(position: Position): void;
    public setPosition(indexOrPosition: number | Position, line?: number, column?: number): void {
        if (typeof indexOrPosition === 'object') {
            this.index = indexOrPosition.index || 0;
            this.line = indexOrPosition.line || 1;
            this.column = indexOrPosition.column || 1;
        } else {
            this.index = indexOrPosition || 0;
            this.line = line || 1;
            this.column = column || 1;
        }
    }

    /**
     * Makes the stream class itself an iterable, allowing it to be used in `for...of` loops.
     * @returns {IterableIterator<Character>} The stream instance.
     */
    public [Symbol.iterator](): IterableIterator<Character> {
        return this;
    }

    /**
     * Consumes and returns the next character in the stream, advancing the cursor.
     * Part of the Iterator protocol.
     * @returns {IteratorResult<Character>} An object with `done` and `value` properties.
     */
    public next(): IteratorResult<Character> {
        if (this.isEOF()) return { done: true, value: this.atEOF() };

        const nextChar = this.peek();
        this.advance(nextChar.value);
        this.charsBuffer.push(nextChar);
        return { done: false, value: nextChar };
    }

    /**
     * Looks at a character ahead in the stream *without consuming it*.
     * The stream's position is not changed by this method.
     * @param {number} [n=0] - The number of characters to look ahead (0 for the current character).
     * @returns {Character} The character at the specified lookahead position, or an EOF character if out of bounds.
     */
    public peek(n: number = 0): Character {
        const pos = this.peekPosition(n);
        if (this.isEOF(pos.index)) return this.atEOF( pos );

        const value = String.fromCodePoint(this.source.codePointAt(pos.index)!);

        return {
            value,
            type: CharUtility.classify(value),
            position: pos
        };
    }

    /**
     * Simulates `n` advances to find the position of a future character.
     * @private
     * @param {number} n - The number of characters to peek forward.
     * @returns {Position} The calculated position `n` characters from the current cursor.
     * @throws {Error} If `n` is negative.
     */
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

    /**
     * The core logic for calculating the position of the character immediately
     * after a given position, correctly handling multi-byte characters and newlines.
     * @private
     * @param {Position} pos - The starting position.
     * @returns {Position} The position of the next character.
     */
    private calculateNextPosition(pos: Position): Position {
        const codePoint = this.source.codePointAt(pos.index)!;
        const charValue = String.fromCodePoint(codePoint);
        const newIndex = pos.index + charValue.length;

        if (charValue === '\n') {
            return {
                index: newIndex,
                line: pos.line + 1,
                column: 1
            };
        } else {
            return {
                index: newIndex,
                line: pos.line,
                column: pos.column + [...charValue].length
            };
        }
    }

    /**
     * A simplified version of `peek` that returns only the string value of a future character.
     * @param {number} [n=0] - The number of characters to look ahead.
     * @returns {string} The string value of the character, or an empty string if at EOF.
     */
    public lookahead(n: number = 0): string {
        const lookaheadIndex = this.peekPosition(n).index;
        if (this.isEOF(lookaheadIndex)) return '';
        const codePoint = this.source.codePointAt(lookaheadIndex)!;
        return String.fromCodePoint(codePoint);
    }

    /**
     * Searches backwards through the character buffer and collects a contiguous
     * sequence of characters that match a predicate. The stream's position is not changed.
     * @param predicate A function returning true for characters to include.
     * @returns {Character[]} An array of matching characters, in their original forward order.
     */
    public lookbackWhile(predicate: (char: Character) => boolean): Character[] {
        if (this.charsBuffer.length === 0) return [];

        const lookedBackChars: Character[] = [];
        for (let i = this.charsBuffer.length - 1; i >= 0; i--) {
            const char = this.charsBuffer[i]!;
            if (predicate(char)) {
                lookedBackChars.push(char);
            } else {
                break;
            }
        }
        // Reverse the array to return them in their natural, forward-read order.
        return lookedBackChars.reverse();
    }

    /**
     * The internal method for moving the stream's cursor forward after a character has been processed.
     * @param {string} charValue - The value of the character being advanced past.
     */
    public advance(charValue: string): void {
        this.index += charValue.length;
        if (charValue === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column += [...charValue].length;
        }
    }

    /**
     * Rewinds the stream's position by a given number of steps by popping
     * characters from the history buffer.
     * @param {number} [steps=1] - The number of characters to rewind.
     * @throws {Error} If `steps` is greater than the number of characters in the history buffer.
     */
    public back(steps: number = 1): void {
        if (steps <= 0) return;

        if (steps > this.charsBuffer.length) {
            throw new Error(
                `Cannot go back ${steps} steps. History only contains ${this.charsBuffer.length} characters to go back to.`
            );
        }

        for (let i = 0; i < steps; i++) this.charsBuffer.pop();

        const newPosition = this.charsBuffer.length > 0
            ? this.calculateNextPosition(this.charsBuffer[this.charsBuffer.length - 1]!.position)
            : { index: 0, line: 1, column: 1 };

        this.setPosition(newPosition);
    }

    /**
     * Saves the current stream position to a stack. This is useful for speculative
     * parsing, allowing you to "try" a path and then either `reset()` on failure
     * or `commit()` on success.
     */
    public mark(): void {
        this.marks.push(this.charsBuffer.length);
    }

    /**
     * Restores the stream to the last saved position from the `mark()` stack.
     * This operation consumes the mark.
     * @throws {Error} If no mark has been set.
     */
    public reset(): void {
        if (this.marks.length === 0) throw new Error("Cannot reset. No mark has been set.");

        const markedLength = this.marks.pop()!;
        const lastCharPos = this.charsBuffer[markedLength - 1]?.position;

        const resetPosition = lastCharPos
            ? this.calculateNextPosition(lastCharPos)
            : { index: 0, line: 1, column: 1 };

        this.charsBuffer.length = markedLength;
        this.setPosition(resetPosition);
    }

    /**
     * Discards the most recent mark from the stack without changing the stream's position.
     * This should be called after a speculative parse succeeds.
     * @throws {Error} If no mark has been set.
     */
    public commit(): void {
        if (this.marks.length === 0) throw new Error("Cannot commit. No mark has been set.");
        this.marks.pop();
    }

    /**
     * Consumes characters from the stream as long as the predicate returns true.
     * @param predicate A function that takes a `Character` and returns a boolean.
     * @returns {Character[]} An array of the consumed characters.
     */
    public consumeWhile(predicate: (char: Character) => boolean): Character[] {
        const consumed: Character[] = [];
        while (!this.isEOF() && predicate(this.peek())) {
            const result = this.next();
            consumed.push(result.value as Character);
        }
        return consumed;
    }

    /**
     * Checks if the stream's cursor is at or past the end of the source string.
     * @param {number} [index=this.index] - An optional index to check; defaults to the current cursor index.
     * @returns {boolean} True if the index is at or past the end of the source.
     */
    public isEOF(index?: number): boolean {
        index = index !== undefined ? index : this.index;
        return index >= this.source.length;
    }

    /**
     * Constructs a standard `Character` object representing the End-Of-File state.
     * @param {Position} [pos=this.getPosition()] - An optional position for the EOF character; defaults to the current position.
     * @returns {Character} The EOF character object.
     */
    public atEOF(pos?: Position): Character {
        return ({
            value: '',
            type: CharType.EOF,
            position: pos || this.getPosition(),
        });
    }

    /**
     * Constructs a standard `Character` object representing an error state.
     * @returns {Character} The Error character object at the current position.
     */
    public atError(): Character {
        return {
            value: 'Error',
            type: CharType.Other,
            position: this.getPosition(),
        };
    }
} // End class CharacterStream








//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Character.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Context.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/Context.ts

import { type Character, CharType } from './Character.ts';
import { TokenType } from './Tokenizer.ts';

enum State {
    INITIAL,
    IN_IDENTIFIER,
    IN_STRING,
    IN_HEXVALUE,
    IN_NUMBER,
    IN_PERCENT,
    IN_DIMENSION,
    IN_EQUALS,
    IN_PLUS,
    IN_MINUS,
    IN_STAR,
    IN_DOT,
    IN_COMMA,
    IN_SLASH,
    IN_LPAREN,
    IN_RPAREN,
    IN_ESCAPE,
    IN_SYMBOL,
    IN_NEWLINE,
    IN_WHITESPACE,
    IN_EOF,
    IN_OTHER,
    IN_ERROR,
    END,
}

// The instructions the Context gives back to the Tokenizer.
interface ContextAction {
    emit: boolean;        // Should the current buffer be emitted as a token?
    reprocess: boolean;   // Should the current character be re-processed in the new state?
    ignore: boolean;      // Should the current character be ignored and not buffered?
    tokenType: TokenType; // What type of token should be emitted?
}

/**
 * The Context class is a state machine that tracks the current tokenizing state.
 * It receives characters one by one and tells the Tokenizer how to handle them.
 */
class Context {
    private state: State = State.INITIAL;
    private quoteType: CharType.Backtick | CharType.SingleQuote | CharType.DoubleQuote | null = null;

    /**
     * Resets the context to its initial clean state.
     */
    public reset(): void {
        this.state = State.INITIAL;
        this.quoteType = null;
    }

    /**
     * Gets the current state of the context.
     * @returns {State} The current state.
     */
    public getState(): State {
        return this.state;
    }

    /**
     * The core processing logic of the state machine.
     * @param char The character to process.
     * @returns {ContextAction} The action for the Tokenizer to take.
     */
    public process(char: Character): ContextAction {
        switch (this.state) {
            case State.INITIAL:
                return this.processInitial(char);
            case State.IN_IDENTIFIER:
                return this.processIdentifier(char);
            case State.IN_HEXVALUE:
                return this.processHex(char);
            case State.IN_NUMBER:
                return this.processNumber(char);
            case State.IN_PERCENT:
                return this.processPercent(char);
            case State.IN_STRING:
                return this.processString(char);
            case State.IN_ESCAPE:
                return this.processEscape(char);
            case State.IN_SYMBOL:
                return this.processSymbol(char);
        }
        // This part is effectively unreachable with a complete switch, which is good.
        /* v8 ignore next -- @preserve */
        this.state = State.INITIAL;
        /* v8 ignore next -- @preserve */
        return { emit: false, reprocess: true, ignore: true, tokenType: TokenType.OTHER };
    }

    // Handles characters when in the initial state (between tokens).
    private processInitial(char: Character): ContextAction {
        // This is the main dispatcher. It decides where to go based on the first character.
        switch (char.type) {
            case CharType.Letter:
                this.state = State.IN_IDENTIFIER;
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.IDENTIFIER };
            case CharType.Number:
                this.state = State.IN_NUMBER;
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.NUMBER };
            case CharType.Hash:
                this.state = State.IN_HEXVALUE;
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.HEXVALUE };
            case CharType.Backtick:
            case CharType.SingleQuote:
            case CharType.DoubleQuote:
                this.state = State.IN_STRING;
                this.quoteType = char.type;
                return { emit: false, reprocess: false, ignore: true, tokenType: TokenType.STRING };
            case CharType.Whitespace:
            case CharType.NewLine:
            case CharType.EOF:
                // Ignore whitespace between tokens
                return { emit: false, reprocess: false, ignore: true, tokenType: TokenType.OTHER };
            // For all other single-character symbols, we use a generic handler.
            default:
                this.state = State.IN_SYMBOL;
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.SYMBOL };
        }
    }

    // Handles characters when building an identifier.
    private processIdentifier(char: Character): ContextAction {
        if (char.type === CharType.Letter || char.type === CharType.Number) {
            // Continue building the identifier.
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.IDENTIFIER };
        }
        // End of identifier. Emit it and reprocess the current char in the INITIAL state.
        this.state = State.INITIAL;
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.IDENTIFIER };
    }

    // Handles characters when building a number.
    private processNumber(char: Character): ContextAction {
        // If we see a number or a dot, continue building the NUMBER.
        if (char.type === CharType.Number || char.type === CharType.Dot) {
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.NUMBER };
        }

        // If we see a percent sign, transition to the IN_PERCENTAGE state.
        if (char.type === CharType.Percent) {
            this.state = State.IN_PERCENT;
            // Tell the tokenizer to keep buffering, as this '%' is part of our token.
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.PERCENT };
        }

        // For any other character, the number is finished.
        this.state = State.INITIAL;
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.NUMBER };
    }

    // Handles the token when the character *after* the '%' arrives.
    private processPercent(char: Character): ContextAction {
        // The percentage token is complete as soon as we see any new character.
        this.state = State.INITIAL;
        // Emit the buffered "56%" and reprocess the new character.
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.PERCENT };
    }

    // Handles characters when building a hex value.
    private processHex(char: Character): ContextAction {
        // FIX: The regex was incorrect. It should not contain extra brackets.
        if (char.type === CharType.Number ||
            (char.type === CharType.Letter && /^[0-9a-fA-F]$/i.test(char.value))) {
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.HEXVALUE };
        }
        /* v8 ignore next -- @preserve */
        this.state = State.INITIAL;
        /* v8 ignore next -- @preserve */
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.HEXVALUE };
    }

    // Handles characters when inside a string.
    private processString(char: Character): ContextAction {
        // If we see a backslash, set the escape flag for the *next* character.
        if (char.type === CharType.BackSlash) {
            this.state = State.IN_ESCAPE;
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.STRING };
        }

        // If we see the matching closing quote (and it was not escaped), the string ends.
        if (char.type === this.quoteType) {
            this.state = State.INITIAL;
            this.quoteType = null;
            return { emit: true, reprocess: false, ignore: true, tokenType: TokenType.STRING };
        }

        // Any other character is just content to be buffered.
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.STRING };
    }

    // Handles escaped characters inside of a string.
    private processEscape(char: Character): ContextAction {
        // After processing an escaped character, we must return to the IN_STRING state,
        this.state = State.IN_STRING;
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.STRING };
    }

    // Handles emitting single-character symbols.
    private processSymbol(char: Character): ContextAction {
        // Any new character means the single symbol is complete.
        this.state = State.INITIAL;
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.SYMBOL };
    }
}

export {
    State,
    type ContextAction,
    Context
}





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Context.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Tokenizer.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/Tokenizer.ts

import { inspect, styleText, type InspectOptions } from 'node:util';
import { Context, State } from './Context.ts';
import { type Character, CharType, CharacterStream } from './Character.ts';
import PrintLine, { Divider } from './PrintLine.ts';

export const MAX_WIDTH: number = 80;

enum TokenType {
    START = 'START',
    IDENTIFIER = 'IDENTIFIER',
    KEYWORD = 'KEYWORD',
    STRING = 'STRING',
    HEXVALUE = 'HEXVALUE',
    NUMBER = 'NUMBER',
    PERCENT = 'PERCENT',
    DIMENSION = 'DIMENSION',
    EQUALS = 'EQUALS',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    STAR = 'STAR',
    DOT = 'DOT',
    COMMA = 'COMMA',
    SLASH = 'SLASH',
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    ESCAPE = 'ESCAPE',
    SYMBOL = 'SYMBOL',
    NEWLINE = 'NEWLINE',
    WHITESPACE = 'WHITESPACE',
    EOF = 'EOF',
    OTHER = 'OTHER',
    ERROR = 'ERROR',
    CONST = 'CONST',
    LET = 'LET',
    FOR = 'FOR',
    OF = 'OF',
    NEW = 'NEW',
}

interface Token {
    value: string;
    type: TokenType;
}

class Tokenizer {
    private printLine;
    private inspectOptions: InspectOptions;
    private ctx;
    private buffer: Character[];
    private stream: CharacterStream | null;
    private shouldLog: boolean;
    private message: string;

    constructor() {
        this.ctx = new Context();
        this.buffer = [];
        this.stream = null;
        this.shouldLog = false;
        this.message = '';

        this.inspectOptions = {
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

        this.printLine = PrintLine;
        return this;
    }

    /**
     * Resets the tokenizer's internal state for a new run.
     */
    private reset(): void {
        this.ctx.reset(); // Reset the state machine
        this.buffer = [];   // Clear the character buffer
    }

    public withLogging(message?: string): this {
        this.shouldLog = true;
        this.message = message || `TOKENIZATION DEMONSTRATION:`;
        return this;
    }

    public withoutLogging(): this {
        this.shouldLog = false;
        this.message = '';
        return this;
    }

    private logHeader(): void {
        if (!this.shouldLog) return;
        this.printLine();
        console.log(`TOKENIZER:\n\n\t${this.message}\n`);
    }

    private logSource(input: CharacterStream): void {
        if (!this.shouldLog) return;
        console.log(`\tSOURCE:\n\n\t${inspect(input.get(), this.inspectOptions)}\n`);
        this.printLine();
    }

    private logResults(result: Token[]): void {
        if (!this.shouldLog) return;

        console.log(`RESULT (TOKENS):\n`);

        for (const item of result) {
            console.log(`\t${inspect(item, this.inspectOptions)}`);
        }

        console.log();
        this.printLine();

        this.shouldLog = false;
        this.message = '';
    }

    /**
     * A map of recognized keywords. Used to convert IDENTIFIER tokens into KEYWORD tokens.
     */
    private static readonly KEYWORDS: Record<string, TokenType> = {
        'deg':  TokenType.DIMENSION,
        'grad': TokenType.DIMENSION,
        'rad': TokenType.DIMENSION,
        'turn': TokenType.DIMENSION,
        'const': TokenType.CONST,
        'let': TokenType.LET,
        'for': TokenType.FOR,
        'of': TokenType.OF,
        'new': TokenType.NEW,
    };

    /**
     * Maps the first character of a generic SYMBOL token to a specific TokenType.
     */
    private static readonly SYMBOL_MAP: Record<string, TokenType> = {
        '=': TokenType.EQUALS, '+': TokenType.PLUS, '-': TokenType.MINUS,
        '*': TokenType.STAR, '.': TokenType.DOT, ',': TokenType.COMMA,
        '/': TokenType.SLASH, '(': TokenType.LPAREN, ')': TokenType.RPAREN,
        '%': TokenType.PERCENT,
        // Add other single-character symbols here
    };

    /**
     * Tokenizes a given character stream.
     * @param {Stream} stream - The input stream to tokenize.
     * @returns {Token[]} An array of tokens.
     */
    public tokenize(stream: CharacterStream): Token[] {
        this.reset();

        this.stream = stream;
        const tokens: Token[] = [];
        let reprocess = false;

        this.logHeader();
        this.logSource(stream);

        for (const char of this.stream) {
            do {
                const action = this.ctx.process(char);
                reprocess = action.reprocess;

                // 1. Handle emitting a token
                if (action.emit && this.buffer.length > 0) {
                    const tokenType = this.ctx.getState() === State.INITIAL
                        ? action.tokenType // Use the type from the action that caused the emit
                        : this.getTokenTypeFromState(this.ctx.getState()); // Or the state we were in

                    tokens.push(this.createToken(tokenType));
                    this.buffer = [];
                }

                // 2. Handle the current character
                if (!action.ignore && !reprocess) {
                    this.buffer.push(char);
                }

            } while (reprocess);
        }

        // After the loop, flush any remaining characters in the buffer.
        if (this.buffer.length > 0) {
            tokens.push(this.createToken(this.getTokenTypeFromState(this.ctx.getState())));
        }

        tokens.push({ value: '', type: TokenType.EOF });
        this.logResults(tokens);
        return tokens;
    }

    /**
     * Maps the final state of the context to a TokenType.
     * @param {State} state - The context state.
     * @returns {TokenType} The corresponding token type.
     */
    private getTokenTypeFromState(state: State): TokenType {
        switch (state) {
            case State.IN_IDENTIFIER: return TokenType.IDENTIFIER;
            case State.IN_NUMBER: return TokenType.NUMBER;
            case State.IN_STRING: return TokenType.STRING;
            case State.IN_HEXVALUE: return TokenType.HEXVALUE;
            case State.IN_PERCENT: return TokenType.PERCENT;
            case State.IN_SYMBOL: return TokenType.SYMBOL;
            /* v8 ignore next -- @preserve */
            default: return TokenType.OTHER;
        }
    }

    /**
     * Creates a token from the current buffer and a given type.
     * This is where keyword checking and string unescaping happens.
     * @param {TokenType} type - The type of token to create, as determined by the Context.
     * @returns {Token} The final token.
     */
    private createToken(type: TokenType): Token {
        if (this.buffer.length === 0) {
            throw new Error('Cannot create token from empty buffer');
        }
        const value = this.buffer.map(c => c.value).join('');

        if (type === TokenType.STRING) {
            return { value: Tokenizer.unescapeString(value), type: TokenType.STRING };
        }

        if (type === TokenType.IDENTIFIER) {
            const keywordType = Tokenizer.KEYWORDS[value];
            if (keywordType) {
                return { value, type: keywordType };
            }
        }

        // If the context identified it as a generic symbol, we now specify it.
        if (type === TokenType.SYMBOL) {
            const specificSymbolType = Tokenizer.SYMBOL_MAP[value];
            if (specificSymbolType) {
                return { value, type: specificSymbolType };
            }
        }

        return { value, type };
    }

    /**
     * Converts escaped sequences in a string to their actual characters.
     * @param {string} input - The raw string content.
     * @returns {string} The unescaped string.
     */
    private static unescapeString(input: string): string {
        // A map for replacements.
        const replacements: Record<string, string> = {
            '\\n': '\n',
            '\\r': '\r',
            '\\t': '\t',
            '\\"': '"',
            "\\'": "'",
            '\\\\': '\\'
        };

        // This regex finds either a simple escape sequence (like \n) or a unicode/hex escape.
        return input.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[nrt'"\\])/g, (match, seq) => {
            if (replacements[match]) return replacements[match];
            if (seq.startsWith('u') || seq.startsWith('x')) {
                return String.fromCharCode(parseInt(seq.slice(1), 16));
            }
            /* v8 ignore next -- @preserve */
            return match;
        });
    }
}

export {
    type Token,
    TokenType,
    Tokenizer
}





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Tokenizer.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████
