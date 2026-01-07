

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
        // Project configuration files
        {
            name: styleText(['red', 'underline'], 'Configuration'),
            outputFile: './ALL/ALL_CONFIGS.ts',
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
        // Main project source files
        {
            name: styleText(['red', 'underline'], 'Typescript'),
            outputFile: './ALL/ALL_FILES.ts',
            patterns: [
                'Consolidate.ts',
                'index.ts',
                'src/**/*.ts',
                'src/**/*.js'
            ],
        },
        // All test files
        {
            name: styleText(['red', 'underline'], 'Test'),
            outputFile: './ALL/ALL_TESTS.ts',
            patterns: [
                'tests/**/*.test.ts',
                'tests/**/*.test.js'
            ],
        },
        // Project configuration files
        {
            name: styleText(['red', 'underline'], 'Configuration'),
            outputFile: './ALL/ALL_CONFIGS.txt',
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
        // Main project source files
        {
            name: styleText(['red', 'underline'], 'Typescript'),
            outputFile: './ALL/ALL_FILES.txt',
            patterns: [
                'Consolidate.ts',
                'index.ts',
                'src/**/*.ts',
                'src/**/*.js'
            ],
        },
        // All test files
        {
            name: styleText(['red', 'underline'], 'Test'),
            outputFile: './ALL/ALL_TESTS.txt',
            patterns: [
                'tests/**/*.test.ts',
                'tests/**/*.test.js'
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
import { Tokenizer } from './src/Tokenizer.ts';
import { Parser } from './src/Parser.ts';
import Char from './src/Character.ts';

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
    `"67 a, b, c / 1 'word' 2 3+(2-0)"`,
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

const characterStreamTest = (str?: string) => {
    line();
    console.log('=== CHARACTERSTREAM DEMO ===\n');
    line();

    const input = str || 'rgb(255, 100, 75)';
    const stream = new Char.Stream(input);

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
    const stream = new Char.Stream();

    for (const test in testCases) {
        stream.set(testCases[test]);
        const tokens = tokenizer
            .withLogging(`TEST (${test}): Direct Tokenization`)
            .tokenize(stream);
    }
}

const parserTest = () => {
    console.log('\n=== TOKENIZATION & PARSING DEMO ===\n');

    for (const input of testCases) {
        line();

        // Step 1: Character stream
        const stream = new Char.Stream(input);

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

//characterStreamTest();
for (const test of testCases) {
    //characterStreamTest(test);
}

tokenizerTest();
//parserTest();





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: index.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/FunctionalStates.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/FunctionalStates.ts

import { inspect, type InspectOptions } from 'node:util';
import Char, { type Character } from './Character.ts';
import { Tokenizer } from './Tokenizer.ts';
import { Parser } from './Parser.ts';

export type Transition =
    | { kind: 'Stay' }
    | { kind: 'To'; state: StateName }
    | { kind: 'EmitAndTo'; state: StateName }
    | { kind: 'ToContinue'; state: StateName }
    | { kind: 'BeginString'; state: StateName; quoteType: Char.Type }
    | { kind: 'EndString'; state: StateName; quoteType: Char.Type }
    | { kind: 'EscapeNext'; state: StateName };

type TransitionFn =
    & { Stay: () => Transition; }
    & { To: (state: StateName) => Transition; }
    & { EmitAndTo: (state: StateName) => Transition; }
    & { ToContinue: (state: StateName) => Transition; }
    & { BeginString: (state: StateName, quoteType: Char.Type) => Transition; }
    & { EndString: (state: StateName, quoteType: Char.Type) => Transition; }
    & { EscapeNext: (state: StateName) => Transition; };

export const Transition: TransitionFn = {
    Stay: (): Transition =>
        ({ kind: 'Stay' }),

    To: (state: StateName): Transition =>
        ({ kind: 'To', state }),

    EmitAndTo: (state: StateName): Transition =>
        ({ kind: 'EmitAndTo', state }),

    ToContinue: (state: StateName): Transition =>
        ({ kind: 'ToContinue', state }),

    BeginString: (state: StateName, quoteType: Char.Type): Transition =>
        ({ kind: 'BeginString', state, quoteType }),

    EndString: (state: StateName, quoteType: Char.Type): Transition =>
        ({ kind: 'EndString', state, quoteType }),

    EscapeNext: (state: StateName): Transition =>
        ({ kind: 'EscapeNext', state }),
}

// Define the available state names as a type for safety
export type StateName =
    | 'Initial' | 'Whitespace' | 'NewLine' | 'Letter'
    | 'Number' | 'Dimension' | 'Hex' | 'String'
    | 'Percent' | 'SingleChar' | 'Symbol' | 'End';

enum State {
    Initial = 'Initial',
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',
    Letter = 'Letter',
    Number = 'Number',
    Dimension = 'Dimension',
    Hex = 'Hex',
    String = 'String',
    Percent = 'Percent',
    SingleChar = 'SingleChar',
    Symbol = 'Symbol',
    End = 'End',
}

// Define the functional state handler type
type StateHandler = (char: Character) => Transition;

export const FunctionalStates: Record<StateName, StateHandler> = {
    [State.Initial]: (char) => {
        switch (char.type) {
            case Char.Type.SingleQuote:
                return Transition.BeginString(State.String, Char.Type.SingleQuote);
            case Char.Type.DoubleQuote:
                return Transition.BeginString(State.String, Char.Type.DoubleQuote);
            case Char.Type.Backtick:
                return Transition.BeginString(State.String, Char.Type.Backtick);
            case Char.Type.Whitespace:
                return Transition.To(State.Whitespace);
            case Char.Type.NewLine:
                return Transition.To(State.NewLine);
            case Char.Type.Letter:
                return Transition.To(State.Letter);
            case Char.Type.Number:
                return Transition.To(State.Number);
            case Char.Type.Hash:
                return Transition.To(State.Hex);

            case Char.Type.Comma: case Char.Type.LParen: case Char.Type.RParen:
            case Char.Type.Plus: case Char.Type.Minus: case Char.Type.Star:
            case Char.Type.Slash: case Char.Type.Percent:
                return Transition.To(State.SingleChar);

            case Char.Type.EOF:
                return Transition.To(State.End);
            default:
                return Transition.To(State.SingleChar);
        }
    },

    [State.Whitespace]: (char) =>
        char.type === Char.Type.Whitespace
            ? Transition.Stay()
            : Transition.EmitAndTo(State.Initial),

    [State.NewLine]: (_) => Transition.EmitAndTo(State.Initial),

    [State.Letter]: (char) =>
        char.type === Char.Type.Letter
            ? Transition.Stay()
            : Transition.EmitAndTo(State.Initial),

    [State.Number]: (char) => {
        if (char.type === Char.Type.Number || char.type === Char.Type.Dot)
            return Transition.Stay();
        
        if (char.type === Char.Type.Percent)
            return Transition.ToContinue(State.Percent);

        if (char.type === Char.Type.Letter)
            return Transition.ToContinue(State.Dimension);

        return Transition.EmitAndTo(State.Initial);
    },

    [State.Dimension]: (char) =>
        char.type === Char.Type.Letter
            ? Transition.Stay()
            : Transition.EmitAndTo(State.Initial),

    [State.Hex]: (char) => {
        const isHex =
            char.type === Char.Type.Hash ||
            char.type === Char.Type.Letter ||
            char.type === Char.Type.Number;
        return isHex ? Transition.Stay() : Transition.EmitAndTo(State.Initial);
    },

    [State.String]: (char) => {
        if (char.type === Char.Type.BackSlash)
            return Transition.EscapeNext(State.String);
        if (
            char.type === Char.Type.SingleQuote ||
            char.type === Char.Type.DoubleQuote ||
            char.type === Char.Type.Backtick
        ) {
            return Transition.EndString(State.Initial, char.type);
        }

        if (char.type === Char.Type.EOF || char.type === Char.Type.NewLine)
            return Transition.EmitAndTo(State.Initial);
        return Transition.Stay();
    },

    [State.Percent]: (_) => Transition.EmitAndTo(State.Initial),

    [State.SingleChar]: (_) => Transition.EmitAndTo(State.Initial),

    [State.Symbol]: (char) => {
        const isSym = [
            Char.Type.Unicode,
            Char.Type.BackSlash,
            Char.Type.At,
            Char.Type.Symbol
        ].includes(char.type);
        return isSym ? Transition.Stay() : Transition.EmitAndTo(State.Initial);
    },

    [State.End]: (_) => Transition.Stay(),
}

// Define which states are "Accepting" (can produce a token)
export const AcceptingStates = new Set<StateName>([
    State.Whitespace,
    State.NewLine,
    State.Letter,
    State.Number,
    State.Dimension,
    State.Hex,
    State.String,
    State.Percent,
    State.SingleChar,
    State.Symbol,
    State.End
]);

// TESTING
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

const characterStreamTest = () => {
    line();
    console.log('=== Char.Stream DEMO ===\n');
    line();

    const input = 'rgba(255, 100, 75, 50%)';

    const stream = new Char.Stream(input);
    let currentState: StateName = State.Initial;
    
    console.log(`INPUT: '${input}'\n`);
    console.log('RESULT OF Char.Stream:\n');
    
    for (const char of stream) {
        const ch = { value: char.value, type: char.type };
        const wasAccepting = AcceptingStates.has(currentState);
        const transition = FunctionalStates[currentState](char);
        console.log(inspect(ch, compactInspectOptions));
        console.log('WAS ACCEPTING:', wasAccepting, inspect(transition, compactInspectOptions));
        console.log();
        if ('state' in transition) {
            currentState = transition.state;
        }
    }
    
    line();
    console.log('NEW TEST\n')
    line();

    stream.set(input);

    // Step 1: Tokenize
    const tokenizer = new Tokenizer();
    const tokens = tokenizer
        .withLogging(`PARSER TEST:\n\nINPUT:\t'${input}'\n\n${'─'.repeat(80)}`)
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

characterStreamTest();




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/FunctionalStates.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/AST.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/AST.ts

/**
 * Node Types
 */
export enum NodeType {
    Program = 'Program',
    Declaration = 'Declaration',
    VariableDeclaration = 'VariableDeclaration',
    Statement = 'Statement',
    Expression = 'Expression',
    ExpressionStatement = 'ExpressionStatement',
    Identifier = 'Identifier',
    StringLiteral = 'StringLiteral',
    NumericLiteral = 'NumericLiteral',
    HexLiteral = 'HexLiteral',
    PercentLiteral = 'PercentLiteral',
    DimensionLiteral = 'DimensionLiteral',
    BinaryExpression = 'BinaryExpression',
    UnaryExpression = 'UnaryExpression',
    CallExpression = 'CallExpression',
    GroupExpression = 'GroupExpression',
}

/**
 * Base interface for all AST nodes
 */
export interface ASTNode {
    /** Type of the AST node */
    type: NodeType;
    /** Source location information */
    location?: SourceLocation;
}

/**
 * Source code location metadata
 */
export interface SourceLocation {
    /** Starting position */
    start: Position;
    /** Ending position */
    end: Position;
}

/**
 * Position in source code
 */
export interface Position {
    /** Byte index */
    index: number;
    /** Line number (1-indexed) */
    line: number;
    /** Column number (1-indexed) */
    column: number;
}

/**
 * Program root node - contains all statements
 */
export interface Program extends ASTNode {
    type: NodeType.Program;
    body: Statement[];
}

/**
 * Base type for all statements
 */
export type Statement = ExpressionStatement | VariableDeclaration;

/**
 * Expression wrapped as a statement
 */
export interface ExpressionStatement extends ASTNode {
    type: NodeType.ExpressionStatement;
    expression: Expression;
}

/**
 * Variable declaration node
 * Example: const x = 5;
 */
export interface VariableDeclaration extends ASTNode {
    type: NodeType.VariableDeclaration;
    /** The kind of declaration (e.g., const, let, var) */
    kind: 'const' | 'let' | 'var';
    /** The identifier being declared */
    identifier: Identifier;
    /** The expression the variable is initialized to (optional) */
    initializer?: Expression;
}

/**
 * Base type for all expressions
 */
export type Expression =
    | Identifier
    | StringLiteral
    | NumericLiteral
    | HexLiteral
    | PercentLiteral
    | DimensionLiteral
    | BinaryExpression
    | UnaryExpression
    | CallExpression
    | GroupExpression;

/**
 * Identifier node (variable names, function names)
 * Example: red, myVar
 */
export interface Identifier extends ASTNode {
    type: NodeType.Identifier;
    name: string;
}

/**
 * String literal node
 * Example: "hello", 'world'
 */
export interface StringLiteral extends ASTNode {
    type: NodeType.StringLiteral;
    value: string;
    raw: string;
}

/**
 * Numeric literal node
 * Example: 42, 3.14
 */
export interface NumericLiteral extends ASTNode {
    type: NodeType.NumericLiteral;
    value: number;
    raw: string;
}

/**
 * Hexadecimal color literal
 * Example: #ff0000, #abc
 */
export interface HexLiteral extends ASTNode {
    type: NodeType.HexLiteral;
    value: string;
    raw: string;
}

/**
 * Percentage literal
 * Example: 50%, 100%
 */
export interface PercentLiteral extends ASTNode {
    type: NodeType.PercentLiteral;
    value: number;
    raw: string;
}

export interface DimensionLiteral extends ASTNode {
    type: NodeType.DimensionLiteral;
    value: number;
    unit: string;
    raw: string;
}

/**
 * Binary operation (two operands and an operator)
 * Example: 1 + 2, a - b
 */
export interface BinaryExpression extends ASTNode {
    type: NodeType.BinaryExpression;
    operator: '+' | '-' | '*' | '/' | '%';
    left: Expression;
    right: Expression;
}

/**
 * Unary operation (one operand and an operator)
 * Example: -5, +10
 */
export interface UnaryExpression extends ASTNode {
    type: NodeType.UnaryExpression;
    operator: '+' | '-';
    argument: Expression;
}

/**
 * Function call expression
 * Example: rgb(255, 0, 0)
 */
export interface CallExpression extends ASTNode {
    type: NodeType.CallExpression;
    callee: Identifier;
    arguments: Expression[];
}

/**
 * Grouped expression (parentheses)
 * Example: (1 + 2)
 */
export interface GroupExpression extends ASTNode {
    type: NodeType.GroupExpression;
    expression: Expression;
}




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/AST.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Character.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/Character.ts

export interface Position {
    index: number;
    line: number;
    column: number;
}

export interface Character {
    value: string;
    type: Char.Type;
    position: Position;
}

namespace Char {
    export enum Type {
        Unicode = 'Unicode',
        Whitespace = 'Whitespace',
        NewLine = 'NewLine',
        Letter = 'Letter',
        Number = 'Number',
        Punctuation = 'Punctuation',
        Percent = 'Percent',
        Hash = 'Hash',
        Hex = 'Hex',
        Slash = 'Slash',
        BackSlash = 'BackSlash',
        Comma = 'Comma',
        RParen = 'RParen',
        LParen = 'LParen',
        Plus = 'Plus',
        Minus = 'Minus',
        Star = 'Star',
        Dot = 'Dot',
        Backtick = 'Backtick',
        SingleQuote = 'SingleQuote',
        DoubleQuote = 'DoubleQuote',
        Tilde = 'Tilde',
        Exclamation = 'Exclamation',
        At = 'At',
        Dollar = 'Dollar',
        Question = 'Question',
        Caret = 'Caret',
        Ampersand = 'Ampersand',
        LessThan = 'LessThan',
        GreaterThan = 'GreaterThan',
        Underscore = 'Underscore',
        EqualSign = 'EqualSign',
        LBracket = 'LBracket',
        RBracket = 'RBracket',
        LBrace = 'LBrace',
        RBrace = 'RBrace',
        SemiColon = 'SemiColon',
        Colon = 'Colon',
        Pipe = 'Pipe',
        Currency = 'Currency',
        Symbol = 'Symbol',
        Other = 'Other',
        EOF = 'EOF',
        Error = 'Error',
    } // End enum Type

    export class Utility {
        private static readonly RegexMap: Partial<Record<Type, ((char: string) => boolean)>> = {
            // Handle Whitespace and Newlines
            [Type.NewLine]: (char: string) => /[\n\r]/.test(char),
            [Type.Whitespace]: (char: string) => /^\s+$/.test(char) && !/[\n\r]/.test(char),

            // Handle Letters and Numbers (Unicode aware)
            [Type.Letter]: (char: string) => /\p{L}/u.test(char),
            [Type.Number]: (char: string) => /\p{N}/u.test(char),

            // Handle specific Unicode categories
            [Type.Punctuation]: (char: string) => /\p{P}/u.test(char),
            [Type.Currency]: (char: string) => /\p{Sc}/u.test(char),
            [Type.Symbol]: (char: string) => /\p{S}/u.test(char),
            [Type.Unicode]: (char: string) => /\P{ASCII}/u.test(char),
        };

        /**
         * Map of single characters to their specific types.
         * This provides O(1) lookup for common symbols.
         */
        private static readonly SymbolMap: Record<string, Type> = {
            '#': Type.Hash,
            '%': Type.Percent,
            '/': Type.Slash,
            ',': Type.Comma,
            '(': Type.LParen,
            ')': Type.RParen,
            '+': Type.Plus,
            '-': Type.Minus,
            '*': Type.Star,
            '.': Type.Dot,
            '`': Type.Backtick,
            "'": Type.SingleQuote,
            '"': Type.DoubleQuote,
            '\\': Type.BackSlash,
            '~': Type.Tilde,
            '!': Type.Exclamation,
            '@': Type.At,
            '$': Type.Dollar,
            '?': Type.Question,
            '^': Type.Caret,
            '&': Type.Ampersand,
            '<': Type.LessThan,
            '>': Type.GreaterThan,
            '_': Type.Underscore,
            '=': Type.EqualSign,
            '[': Type.LBracket,
            ']': Type.RBracket,
            '{': Type.LBrace,
            '}': Type.RBrace,
            ';': Type.SemiColon,
            ':': Type.Colon,
            '|': Type.Pipe,
        };

        /**
         * Classifies a character using a fast switch for single chars
         * and regex for character categories.
         * This method is now stateless and side-effect free.
        */
        public static classify(char: string): Type {
            // 1. Handle EOF, undefined and null
            if (char === '') return this.handleEOF();
            if (char === undefined || char === null) return this.handleError(char);

            // 2. Handle characters in the symbol map
            if (this.SymbolMap[char]) return this.SymbolMap[char];

            // 3. Loop through the regex map for character categories.
            for (const type in this.RegexMap) {
                if (this.RegexMap[type as Type]!(char)) return type as Type;
            }

            // 4. Fallback type
            return this.handleOther(char);
        }

        private static handleOther(char: string): Type {
            return Type.Other;
        }

        private static handleError(char: string): Type {
            return Type.Error
        }

        private static handleEOF(): Type {
            return Type.EOF;
        }
    } // End class Utility

    export class Stream implements IterableIterator<Character> {
        // Unicode safe source string for the stream
        private source: string;

        // Current stream cursor/character position information
        private index: number;
        private line: number;
        private column: number;

        // Get the current stream position
        public getPosition(): Position {
            return {
                index: this.index,
                line: this.line,
                column: this.column,
            };
        }

        // Set the current stream position (for back tracking)
        public setPosition(index: number, line: number, column: number): void;
        public setPosition(position: Position): void;
        public setPosition(indexOrPosition: number | Position, line?: number, column?: number): void {
            if (typeof indexOrPosition === 'object') {
                // Handling the Position object case
                this.index = indexOrPosition.index;
                this.line = indexOrPosition.line;
                this.column = indexOrPosition.column;
            } else {
                // Handling the three number arguments case
                this.index = indexOrPosition;
                this.line = line!;
                this.column = column!;
            }
        }

        // Previous character information for backtracking and marking
        // Specific design choice to use a charsBuffer (a buffer of Character 
        // objects) instead of a positionHistory. This provides direct access 
        // to the type and value of historical characters if ever needed.
        public readonly charsBuffer: Character[] = [];
        // Store buffer length, not position of the mark
        private readonly marks: number[] = [];

        constructor(input?: string) {
            this.source = input ? input.normalize('NFC') : ''.normalize('NFC');
            this.index = 0;
            this.line = 1;
            this.column = 1;
        }

        // Get the current source
        public get() {
            return this.source;
        }

        // Create a new stream from a different source;
        public set(input: string) {
            this.source = input.normalize('NFC');
            this.setPosition(0, 1, 1);
            this.charsBuffer.length = 0;
            this.marks.length = 0;
        }

        public [Symbol.iterator](): IterableIterator<Character> {
            return this;
        }

        public next(): IteratorResult<Character> {
            if (this.isEOF()) return { done: true, value: this.atEOF() };
            const nextChar = this.peek(0);
            this.advance(nextChar.value);
            this.charsBuffer.push(nextChar);
            return { done: false, value: nextChar };
        }

        /**
         * Peeks at a character 'n' positions ahead without advancing the stream.
         * @param n The number of characters to look ahead (default: 0, the current character).
         * @returns The character at the specified lookahead position.
         */
        public peek(n: number = 0): Character {
            const { index, line, column } = this.peekPosition(n);
            if (this.isEOF(index)) return this.atEOF({ index, line, column });
            const value = String.fromCodePoint(this.source.codePointAt(index)!);
            return {
                value,
                type: Utility.classify(value),
                position: {
                    index,
                    line,
                    column
                }
            };
        }

        /**
         * Orchestrate the simulation by calling peekAdvance n times.
         * @param n The number of positions forward to look
         * @returns the position of the cursor n characters forward
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
         * Calculate the position of the next character based on a given starting position.
         * @param peekPosition The start position for peeking forward
         * @returns The actual position of the peeked character
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
         * Looks ahead at a character 'n' positions ahead without advancing the stream.
         * @param n The number of characters to look ahead (default: 0, the current character).
         * @returns The character at the specified lookahead position.
         */
        public lookahead(n: number = 0): string {
            const lookaheadIndex = this.peekPosition(n).index;
            if (this.isEOF(lookaheadIndex)) return '';
            const codePoint = this.source.codePointAt(lookaheadIndex)!;
            return String.fromCodePoint(codePoint);
        }

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

            // The characters were collected in reverse order (e.g., '3', '2', '1').
            // Reverse the array to return them in their natural order ('1', '2', '3').
            return lookedBackChars.reverse();
        }

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
         * Moves the stream's position back by a given number of steps.
         * @param steps The number of characters to rewind (default: 1).
         */
        public back(steps: number = 1): void {
            if (steps <= 0) return;

            // The history includes the current position, so the number of "backable"
            // steps is the history length minus one.
            if (steps >= this.charsBuffer.length) {
                throw new Error(
                    `Cannot go back ${steps} steps. History only contains ${this.charsBuffer.length - 1} previous positions.`
                );
            }

            // Pop the requested number of states.
            for (let i = 0; i < steps; i++) this.charsBuffer.pop();

            // The new current position is the one now at the end of the stack.
            const newPosition = this.charsBuffer[this.charsBuffer.length - 1]!.position;
            this.setPosition(newPosition);
        }

        /**
         * Saves the current stream position to a stack.
         * This is useful for speculative parsing, allowing you to "try" a path
         * and then either reset() on failure or commit() on success.
         */
        public mark(): void {
            // Mark the current length of the buffer.
            this.marks.push(this.charsBuffer.length);
        }

        /**
         * Restores the stream to the last saved position from the mark() stack.
         * If no mark is present, it throws an error.
         * This consumes the mark.
         */
        public reset(): void {
            if (this.marks.length === 0) throw new Error("Cannot reset. No mark has been set.");
            const markedLength = this.marks.pop()!;

            // Find the character right before this marked point to get the position.
            const lastCharPos = this.charsBuffer[markedLength - 1]?.position;

            // The position to reset to is after the last valid character.
            const resetPosition = lastCharPos
                ? this.calculateNextPosition(lastCharPos)
                : { index: 0, line: 1, column: 1 }; // Or reset to the beginning.

            // Truncate the buffer *and* reset the position.
            this.charsBuffer.length = markedLength;
            this.setPosition(resetPosition);
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

        /**
         * Consumes characters from the stream as long as the predicate is true.
         * @param predicate A function that takes a Character and returns a boolean.
         * @returns An array of the consumed characters.
         */
        public consumeWhile(predicate: (char: Character) => boolean): Character[] {
            const consumed: Character[] = [];
            while (!this.isEOF() && predicate(this.peek())) {
                // Must call next() to consume and advance
                const result = this.next();
                if (!result.done) {
                    consumed.push(result.value);
                }
            }
            return consumed;
        }

        public isEOF(index = this.index): boolean {
            return index >= this.source.length;
        }

        public atEOF(pos: Position = this.getPosition()): Character {
            return ({
                value: '',
                type: Type.EOF,
                position: pos,
            });
        }

        public atError(): Character {
            return {
                value: 'Error',
                type: Type.Other,
                position: this.getPosition(),
            };
        }
    } // End class Stream
} // End namespace Char

export default Char;




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Character.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Context.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/Context.ts

import Char, { type Character } from './Character.ts';
import { InitialState, State } from './States.ts';
import { Transition } from './Transition.ts';

type Action = 'buffer' | 'ignore';

interface ProcessResult {
    emit: boolean;      // Should we flush the current buffer into a token?
    reprocess: boolean; // Should the current char be looked at again by the next state?
    action: Action;     // Should the current char be added to the buffer?
}

interface StringContext {
    openingQuoteType: Char.Type | null;
    isEscaping: boolean;
    nestingLevel: number;
}

class Context {
    private state: State = InitialState;
    private stringContext: StringContext = {
        openingQuoteType: null,
        isEscaping: false,
        nestingLevel: 0,
    };

    constructor() { }

    public transitionTo(state: State): void {
        this.state = state;
    }

    public getCurrentState(): State {
        return this.state;
    }

    public beginString(quoteType: Char.Type): void {
        this.stringContext.openingQuoteType = quoteType;
        this.stringContext.nestingLevel++;
    }

    public endString(quoteType: Char.Type): void {
        this.stringContext.nestingLevel = Math.max(0, this.stringContext.nestingLevel - 1);
        if (this.stringContext.nestingLevel === 0) {
            this.stringContext.openingQuoteType = null;
        }
    }

    public isInString(): boolean {
        return this.stringContext.nestingLevel > 0;
    }

    public getOpeningQuoteType(): Char.Type | null {
        return this.stringContext.openingQuoteType;
    }

    public isMatchingQuote(quoteType: Char.Type): boolean {
        return this.stringContext.openingQuoteType === quoteType;
    }

    public setEscaping(value: boolean): void {
        this.stringContext.isEscaping = value;
    }

    public isEscaping(): boolean {
        return this.stringContext.isEscaping;
    }

    public process(char: Character): ProcessResult {
        const transition: Transition = this.state.handle(char);
        let emit = false;
        let reprocess = false;
        let action: Action = 'buffer';

        switch (transition.kind) {
            case "BeginString": {
                this.beginString(transition.quoteType);
                this.transitionTo(transition.state);
                action = 'ignore'; // Don't put the opening quote in the buffer
                break;
            }

            case "EndString": {
                if (!this.isMatchingQuote(char.type)) break;
                this.endString(transition.quoteType);
                this.transitionTo(transition.state);
                action = 'ignore'; // Don't put the closing quote in the buffer
                emit = true;
                break;
            }

            case "EmitAndTo": {
                this.transitionTo(transition.state);
                emit = true;
                reprocess = true;
                action = 'ignore'; // This char belongs to the NEXT token
                break;
            }

            case "To": {
                const wasAccepting = this.isAccepting();
                this.transitionTo(transition.state);
                emit = wasAccepting;
                break;
            }

            case "Stay": {
                break;
            }

            case "EscapeNext": {
                this.setEscaping(true);
                this.transitionTo(transition.state);
                reprocess = true;
                action = 'buffer';
                break;
            }

            case "ToContinue": {
                this.transitionTo(transition.state);
                emit = false;
                reprocess = false;
                action = 'buffer';
                break;
            }
        }

        return { emit, reprocess, action };
    }

    public isAccepting(): boolean {
        return this.state.isAccepting;
    }
}

export {
    type Action,
    type ProcessResult,
    type StringContext,
    Context
}




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Context.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Parser.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/Parser.ts

import { type Token, TokenType } from './Tokenizer.ts';
import {
    NodeType,
    type Program,
    type Expression,
    type Statement,
    type ExpressionStatement,
    type VariableDeclaration,
    type Identifier,
    type StringLiteral,
    type NumericLiteral,
    type HexLiteral,
    type PercentLiteral,
    type BinaryExpression,
    type UnaryExpression,
    type CallExpression,
    type GroupExpression,
    type ASTNode,
} from './AST.ts';

/**
 * Recursive descent parser
 * Grammar:
 * Program         → Statement*
 * Statement       → Expression
 * Expression      → Addition
 * Addition        → Multiplication ( ("+" | "-") Multiplication )*
 * Multiplication  → Unary ( ("*" | "/") Unary )*
 * Unary           → ("+" | "-") Unary | Call
 * Call            → Primary ( "(" Arguments? ")" )?
 * Arguments       → Expression ( "," Expression )*
 * Primary         → NUMBER | PERCENT | HEXVALUE | IDENTIFIER | "(" Expression ")"
 */
export class Parser {
    private tokens: Token[];
    private current: number = 0;

    private get nextToken(): Token {
        return this.peek();
    } 

    constructor(tokens: Token[]) {
        this.tokens = tokens.filter(t =>
            t.type !== TokenType.WHITESPACE &&
            t.type !== TokenType.NEWLINE
        );
    }

    public parse(): Program {
        const statements: Statement[] = [];
        while (!this.isAtEnd()) {
            statements.push(this.declaration());
        }
        return {
            type: NodeType.Program,
            body: statements
        };
    }

    private declaration(): Statement {
        if (this.match(TokenType.CONST)) {
            return this.variableDeclaration('const');
        }
        // Add checks for `let`, `function`, etc. here in the future

        // If it's not a known declaration, assume it's a regular statement
        return this.statement();
    }

    private variableDeclaration(kind: 'const' | 'let'): VariableDeclaration {
        const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name.').value;

        this.consume(TokenType.EQUALS, "Expect '=' after variable name.");

        const initializer = this.expression();

        // Assuming you have a Semicolon token type or will handle it
        // this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");

        return {
            type: NodeType.VariableDeclaration,
            kind,
            identifier: { type: NodeType.Identifier, name },
            initializer,
        };
    }

    private statement(): Statement {
        return this.expressionStatement();
    }

    private expressionStatement(): ExpressionStatement {
        const expr = this.expression();
        return {
            type: NodeType.ExpressionStatement,
            expression: expr,
        };
    }

    private expression(): Expression {
        return this.addition();
    }

    private addition(): Expression {
        let expr = this.multiplication();

        while (
            !this.isAtEnd() &&
            this.match(TokenType.PLUS, TokenType.MINUS)
        ) {
            const operator = this.previous().value as '+' | '-';
            const right = this.multiplication();
            expr = {
                type: NodeType.BinaryExpression,
                operator,
                left: expr,
                right,
            } as BinaryExpression;
        }

        return expr;
    }

    private multiplication(): Expression {
        let expr = this.unary();

        while (
            !this.isAtEnd() &&
            this.match(TokenType.STAR, TokenType.SLASH)
        ) {
            const operator = this.previous().value as '*' | '/';
            const right = this.unary();
            expr = {
                type: NodeType.BinaryExpression,
                operator,
                left: expr,
                right,
            } as BinaryExpression;
        }

        return expr;
    }

    private unary(): Expression {
        if (
            !this.isAtEnd() &&
            this.match(TokenType.PLUS, TokenType.MINUS)
        ) {
            const operator = this.previous().value as '+' | '-';
            const argument = this.unary();
            return {
                type: NodeType.UnaryExpression,
                operator,
                argument,
            } as UnaryExpression;
        }

        return this.call();
    }

    private call(): Expression {
        let expr = this.primary();

        // Only parse call if expr is Identifier
        if (
            expr &&
            expr.type === NodeType.Identifier &&
            this.match(TokenType.LPAREN)
        ) {
            const args: Expression[] = [];

            // Parse arguments, skipping commas
            while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) {
                // Skip comma if present
                if (this.check(TokenType.COMMA)) {
                    this.advance();
                    continue;
                }

                const arg = this.expression();
                if (arg) args.push(arg);
            }

            this.consume(TokenType.RPAREN, "Expected ')' after arguments");

            expr = {
                type: NodeType.CallExpression,
                callee: expr as Identifier,
                arguments: args,
            } as CallExpression;
        }

        return expr as Expression;
    }

    private primary(): Expression {
        const token = this.nextToken;

        if (this.isAtEnd()) {
            throw this.error(token, 'Unexpected end of input');
        }

        // Check if it's any type of literal
        if (this.match(
            TokenType.NUMBER,
            TokenType.STRING,
            TokenType.HEXVALUE,
            TokenType.PERCENT,
            TokenType.DIMENSION
        )) {
            return this.createLiteralNode(this.previous());
        }

        switch (token.type) {
            case TokenType.IDENTIFIER: {
                this.advance();
                const token = this.previous();
                return {
                    type: NodeType.Identifier,
                    name: token.value
                } as Identifier;
            }

            case TokenType.LPAREN: {
                this.advance();
                const expr = this.expression();
                this.consume(TokenType.RPAREN, "Expected ')' after expression");
                return {
                    type: NodeType.GroupExpression,
                    expression: expr
                } as GroupExpression;
            }

            default:
                throw this.error(token, `Expected expression, got ${token.type}`);
        }
    }

    private createLiteralNode(token: Token): Expression {
        switch (token.type) {
            case TokenType.STRING: {
                this.advance();
                const token = this.previous();
                return {
                    type: NodeType.StringLiteral,
                    value: token.value,
                    raw: token.value
                } as StringLiteral;
            }

            case TokenType.NUMBER: {
                this.advance();
                const token = this.previous();
                return {
                    type: NodeType.NumericLiteral,
                    value: parseFloat(token.value),
                    raw: token.value
                } as NumericLiteral;
            }

            case TokenType.PERCENT: {
                this.advance();
                const token = this.previous();
                const numStr = token.value.replace('%', '');
                return {
                    type: NodeType.PercentLiteral,
                    value: parseFloat(numStr),
                    raw: token.value
                } as PercentLiteral;
            }

            case TokenType.DIMENSION: {
                this.advance();
                const token = this.previous();
                const match = token.value.match(/^([\d.]+)([a-zA-Z]+)$/)!;

                return {
                    type: NodeType.DimensionLiteral,
                    value: parseFloat(match[1]!),
                    unit: match[2]!,
                    raw: token.value
                };
            }

            case TokenType.HEXVALUE: {
                this.advance();
                const token = this.previous();
                return {
                    type: NodeType.HexLiteral,
                    value: token.value,
                    raw: token.value
                } as HexLiteral;
            }

            default:
                throw this.error(token, `Expected expression, got ${token.type}`);
        }
    }

    // ===== Helper Methods =====

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.nextToken.type === type;
    }

    private advance(): Token {
        this.current++;
        
        while (!this.isAtEnd() && this.isIgnored(this.nextToken)) {
            this.current++;
        }
        return this.previous();
    }

    private isIgnored(token: Token): boolean {
        return token.type === TokenType.WHITESPACE || token.type === TokenType.NEWLINE;
    }

    private isAtEnd(): boolean {
        return this.current >= this.tokens.length || this.nextToken.type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.current] as Token;
    }

    private previous(): Token {
        return this.tokens[this.current - 1] as Token;
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw this.error(this.nextToken, message);
    }

    private error(token: Token, message: string): Error {
        return new Error(`Parse error at '${token.value}': ${message}`);
    }
}




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Parser.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/States.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import Char, { type Character } from './Character.ts';
import { Transition } from './Transition';

abstract class State {
    public abstract isAccepting: boolean;

    protected inspectOptions: InspectOptions = {
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

    public toString(): string {
        return `\t${inspect(this, this.inspectOptions)}`;
    }

    public abstract handle(char: Character): Transition;
}

class Initial_State extends State {
    public isAccepting: boolean = false;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Initial_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            // String delimiters
            case Char.Type.SingleQuote:
                return Transition.BeginString(String_State.instance, Char.Type.SingleQuote);
            case Char.Type.DoubleQuote:
                return Transition.BeginString(String_State.instance, Char.Type.DoubleQuote);
            case Char.Type.Backtick:
                return Transition.BeginString(String_State.instance, Char.Type.Backtick);

            // Whitespace
            case Char.Type.Whitespace:
                return Transition.To(Whitespace_State.instance);
            case Char.Type.NewLine:
                return Transition.To(NewLine_State.instance);

            // Letters
            case Char.Type.Letter:
                return Transition.To(Letter_State.instance);

            // Numbers
            case Char.Type.Number:
                return Transition.To(Number_State.instance);

            // Hexadecimal
            case Char.Type.Hash:
                return Transition.To(Hex_State.instance);

            // All single-character tokens
            case Char.Type.Comma:
            case Char.Type.LParen:
            case Char.Type.RParen:
            case Char.Type.LBracket:
            case Char.Type.RBracket:
            case Char.Type.LBrace:
            case Char.Type.RBrace:
            case Char.Type.SemiColon:
            case Char.Type.Dot:
            case Char.Type.Plus:
            case Char.Type.Minus:
            case Char.Type.Star:
            case Char.Type.Slash:
            case Char.Type.EqualSign:
            case Char.Type.GreaterThan:
            case Char.Type.LessThan:
            case Char.Type.Exclamation:
            case Char.Type.Question:
            case Char.Type.Colon:
            case Char.Type.Caret:
            case Char.Type.Ampersand:
            case Char.Type.Pipe:
            case Char.Type.Tilde:
            case Char.Type.At:
            case Char.Type.Dollar:
            case Char.Type.Underscore:
            case Char.Type.Symbol:
                return Transition.To(SingleChar_State.instance);

            case Char.Type.BackSlash:
            case Char.Type.Unicode:
                return Transition.To(Symbol_State.instance);

            case Char.Type.Other:
                return Transition.To(SingleChar_State.instance);

            case Char.Type.EOF:
                return Transition.To(End_State.instance);

            case Char.Type.Error:
                return Transition.To(End_State.instance);

            default:
                return Transition.Stay();
        }
    }
}

class Whitespace_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Whitespace_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Whitespace:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class NewLine_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new NewLine_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        return Transition.EmitAndTo(Initial_State.instance);
    }
}

class Letter_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Letter_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Letter:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class Number_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Number_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Number:
            case Char.Type.Dot:
                return Transition.Stay();

            case Char.Type.Percent:
                return Transition.ToContinue(Percent_State.instance);

            case Char.Type.Letter:
                return Transition.ToContinue(Dimension_State.instance);

            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class Dimension_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Dimension_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Letter:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class Hex_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Hex_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Hash:
            case Char.Type.Hex:
            case Char.Type.Letter:
            case Char.Type.Number:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class String_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new String_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.BackSlash:
                return Transition.EscapeNext(String_State.instance);

            case Char.Type.SingleQuote:
                return Transition.EndString(Initial_State.instance, Char.Type.SingleQuote);

            case Char.Type.DoubleQuote:
                return Transition.EndString(Initial_State.instance, Char.Type.DoubleQuote);

            case Char.Type.Backtick:
                return Transition.EndString(Initial_State.instance, Char.Type.Backtick);

            case Char.Type.EOF:
            case Char.Type.NewLine:
                return Transition.EmitAndTo(Initial_State.instance);

            default:
                return Transition.Stay();
        }
    }
}

class Percent_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Percent_State();
        }
        return this.#instance;
    }

    public handle(_: Character): Transition {
        return Transition.EmitAndTo(Initial_State.instance);
    }
}

class SingleChar_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new SingleChar_State();
        }
        return this.#instance;
    }

    public handle(_: Character): Transition {
        return Transition.EmitAndTo(Initial_State.instance);
    }
}

class Symbol_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Symbol_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Unicode:
            case Char.Type.BackSlash:
            case Char.Type.At:
            case Char.Type.Dollar:
            case Char.Type.Underscore:
            case Char.Type.Symbol:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class End_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new End_State();
        }
        return this.#instance;
    }

    public handle(_: Character): Transition {
        return Transition.Stay();
    }
}

const InitialState = Initial_State.instance;
const WhitespaceState = Whitespace_State.instance;
const NewLineState = NewLine_State.instance;
const LetterState = Letter_State.instance;
const NumberState = Number_State.instance;
const DimensionState = Dimension_State.instance;
const HexState = Hex_State.instance;
const StringState = String_State.instance;
const PercentState = Percent_State.instance;
const SingleCharState = SingleChar_State.instance;
const SymbolState = Symbol_State.instance;
const EndState = End_State.instance;

export {
    InitialState,
    WhitespaceState,
    NewLineState,
    LetterState,
    NumberState,
    DimensionState,
    HexState,
    StringState,
    PercentState,
    SingleCharState,
    SymbolState,
    EndState,
    State,
}




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/States.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Tokenizer.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/Tokenizer.ts

import { inspect, styleText, type InspectOptions } from 'node:util';
import { Context } from './Context.ts';
import Char, { type Character } from './Character.ts';

export const MAX_WIDTH: number = 80;

enum Line  {
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

type ClassifyTokenFn = (char: Character, isInString: boolean) => TokenType;
type TokenTypeFn = (type: Char.Type) => boolean;
type TokenSpec = Map<TokenType, TokenTypeFn>;

enum TokenType {
    START = 'START',
    IDENTIFIER = 'IDENTIFIER',
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

/**
 * @interface PrintLineOptions
 * @description Defines the structure for a printLine options object.
 * @property {boolean} preNewLine - If true, adds a newline before the divider.
 * @property {boolean} postNewLine - If true, adds a newline after the divider.
 * @property {number} width - The width of the line.
 * @property {string} line - The character to use for the line.
 */
interface PrintLineOptions {
    preNewLine?: boolean;
    postNewLine?: boolean;
    width?: number;
    line?: Line;
}

/**
 * @description Default options object for the printLine function.
 */
const defaultPrintLineOptions: PrintLineOptions = {
    preNewLine: false,  // No preceding new line
    postNewLine: false, // No successive new line
    width: MAX_WIDTH,   // Use global const MAX_WIDTH = 80
    line: Line.Double,    // Use global const LINE_CHAR = '='          
};

interface Token {
    value: string;
    type: TokenType;
}

type TokenizerInput = Char.Stream;

class Tokenizer {
    private inspectOptions: InspectOptions = {
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
    private ctx = new Context();
    private buffer: Character[] = [];
    private shouldLog: boolean = false;
    private message: string | undefined = undefined;

    constructor() { }

    public withLogging(message?: string): this {
        this.shouldLog = true;
        this.message = message || undefined;
        return this;
    }

    public withoutLogging(): this {
        this.shouldLog = false;
        this.message = undefined;
        return this;
    }

    /**
     * @function printLine
     * @description Prints a styled horizontal line to the console.
     * @param {PrintLineOptions} [options={}] - Configuration options for the line.
     * @returns {void}
     */
    private printLine = (options: PrintLineOptions = {}): void => {
        const { preNewLine, postNewLine, width, line } = {
            ...defaultPrintLineOptions,
            ...options
        };
        const pre = preNewLine ? '\n' : '';
        const post = postNewLine ? '\n' : '';
        const styledDivider = styleText(['gray', 'bold'], line!.repeat(width!));
        console.log(`${pre}${styledDivider}${post}`);
    };

    private logHeader(): void {
        if (!this.shouldLog) return;
        this.printLine();
        this.message = this.message ? this.message : `TOKENIZATION DEMONSTRATION:`;
        console.log(`TOKENIZER:\n\t${this.message}\n`);
    }

    private logSource(input: TokenizerInput): void {
        if (!this.shouldLog) return;
        console.log(`SOURCE:\t${inspect(input.get(), this.inspectOptions)}\n`);
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
        this.message = undefined;
    }

    public tokenize(stream: Char.Stream): Token[] {
        const tokens: Token[] = [];

        this.logHeader();
        this.logSource(stream);

        for (const char of stream) {
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
                if (result.emit && this.buffer.length > 0) {
                    tokens.push(Tokenizer.createToken(this.buffer, wasInString));
                    this.buffer = [];
                }
            }

            // 3. Buffer the character based on the Context's decision
            if (result.action === 'buffer' && char.type !== Char.Type.EOF) {
                this.buffer.push(char);
            }
        }

        // Flush remaining buffer
        if (this.buffer.length > 0) {
            tokens.push(Tokenizer.createToken(this.buffer, this.ctx.isInString()));
        }

        tokens.push({ value: '', type: TokenType.EOF });

        this.buffer = [];
        this.logResults(tokens);
        return tokens;
    }

    public static createToken(chars: Character[], isInString: boolean = false): Token {
        if (chars.length === 0) throw new Error('Cannot create token from empty buffer');

        let value = '';
        for (const ch of chars) {
            value += ch.value;
        }

        if (isInString) {
            const unescaped = Tokenizer.unescapeString(value);
            console.log('CREATETOKEN: VALUE:', inspect(value, inspectOptions))
            return {
                value: unescaped,
                type: TokenType.STRING
            };
        }

        const keywordType = Tokenizer.KEYWORDS[value];
        if (keywordType) return { value, type: keywordType };

        const ch = {
            value,
            type: chars[0]!.type,
            position: chars[0]!.position
        };

        return {
            value,
            type: Tokenizer.classify(ch, isInString)
        };
    }

    private static KEYWORDS: Record<string, TokenType> = {
        'const': TokenType.CONST,
        'let': TokenType.LET,
        'for': TokenType.FOR,
        'of': TokenType.OF,
        'new': TokenType.NEW,
    };

    private static TokenSpec: TokenSpec = new Map<TokenType, TokenTypeFn>([
        [TokenType.IDENTIFIER, (type) => type === Char.Type.Letter],
        [TokenType.HEXVALUE, (type) => type === Char.Type.Hash || type === Char.Type.Hex],
        [TokenType.NUMBER, (type) => type === Char.Type.Number],
        [TokenType.PERCENT, (type) => type === Char.Type.Percent],
        [TokenType.PLUS, (type) => type === Char.Type.Plus],
        [TokenType.MINUS, (type) => type === Char.Type.Minus],
        [TokenType.STAR, (type) => type === Char.Type.Star],
        [TokenType.DOT, (type) => type === Char.Type.Dot],
        [TokenType.COMMA, (type) => type === Char.Type.Comma],
        [TokenType.SLASH, (type) => type === Char.Type.Slash],
        [TokenType.LPAREN, (type) => type === Char.Type.LParen],
        [TokenType.RPAREN, (type) => type === Char.Type.RParen],
        [TokenType.NEWLINE, (type) => type === Char.Type.NewLine],
        [TokenType.WHITESPACE, (type) => type === Char.Type.Whitespace],
        [TokenType.EOF, (type) => type === Char.Type.EOF],
        [TokenType.OTHER, (type) => type === Char.Type.Other],
        [TokenType.ERROR, (type) => type === Char.Type.Error],
    ])

    private static classify: ClassifyTokenFn = (char: Character, isInString: boolean = false): TokenType => {
        const value = char.value;

        if (isInString) return TokenType.STRING;

        if (value.endsWith('%')) {
            return TokenType.PERCENT;
        }

        if (value.startsWith('#')) return TokenType.HEXVALUE;

        if (value.endsWith('deg') || value.endsWith('grad') ||
            value.endsWith('rad') || value.endsWith('turn')) {
            return TokenType.DIMENSION;
        }

        switch (char.type) {
            case Char.Type.BackSlash:
                return isInString ? TokenType.ESCAPE : TokenType.SYMBOL;

            case Char.Type.EqualSign:
                return TokenType.EQUALS;

            case Char.Type.Unicode:
            case Char.Type.Tilde:
            case Char.Type.Exclamation:
            case Char.Type.At:
            case Char.Type.Dollar:
            case Char.Type.Question:
            case Char.Type.Caret:
            case Char.Type.Ampersand:
            case Char.Type.LessThan:
            case Char.Type.GreaterThan:
            case Char.Type.Underscore:
            case Char.Type.LBracket:
            case Char.Type.RBracket:
            case Char.Type.LBrace:
            case Char.Type.RBrace:
            case Char.Type.SemiColon:
            case Char.Type.Colon:
            case Char.Type.Pipe:
            case Char.Type.Symbol:
                return TokenType.SYMBOL;

            default:
                for (const [tokenType, fn] of Tokenizer.TokenSpec) {
                    if (fn(char.type)) {
                        return tokenType;
                    }
                }
                break;
        }
        return TokenType.OTHER;
    };

    /**
     * Converts escaped sequences in a string to their actual characters
     * Supports: \n, \t, \r, \', \", \\, \uXXXX, \xXX
     */
    private static unescapeString(input: string): string {
        return input.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[nrt'\"\\])/g, (match, seq) => {
            switch (true) {
                // Unicode escape: \uXXXX
                case /^u[0-9a-fA-F]{4}$/.test(seq):
                    return String.fromCharCode(parseInt(seq.slice(1), 16));

                // Hex escape: \xXX
                case /^x[0-9a-fA-F]{2}$/.test(seq):
                    return String.fromCharCode(parseInt(seq.slice(1), 16));

                // Single-character escapes
                case seq === 'n':
                    return '\n';
                case seq === 'r':
                    return '\r';
                case seq === 't':
                    return '\t';
                case seq === "'":
                    return "'";
                case seq === '"':
                    return '"';
                case seq === '\\':
                    return '\\';

                default:
                    return seq;
            }
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


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Transition.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/Transition.ts

import { State } from './States.ts';
import Char from './Character.ts';

export type Transition =
    | { kind: 'Stay' }
    | { kind: 'To'; state: State }
    | { kind: 'EmitAndTo'; state: State }
    | { kind: 'ToContinue'; state: State }
    | { kind: 'BeginString'; state: State; quoteType: Char.Type }
    | { kind: 'EndString'; state: State; quoteType: Char.Type }
    | { kind: 'EscapeNext'; state: State };

type TransitionFn =
    & { Stay: () => Transition; }
    & { To: (state: State) => Transition; }
    & { EmitAndTo: (state: State) => Transition; }
    & { ToContinue: (state: State) => Transition; }
    & { BeginString: (state: State, quoteType: Char.Type) => Transition; }
    & { EndString: (state: State, quoteType: Char.Type) => Transition; }
    & { EscapeNext: (state: State) => Transition; };

export const Transition: TransitionFn = {
    Stay: (): Transition => 
        ({ kind: 'Stay' }),

    To: (state: State): Transition => 
        ({ kind: 'To', state }),

    EmitAndTo: (state: State): Transition => 
        ({ kind: 'EmitAndTo', state }),

    ToContinue: (state: State): Transition => 
        ({ kind: 'ToContinue', state }),
    
    BeginString: (state: State, quoteType: Char.Type): Transition =>
        ({ kind: 'BeginString', state, quoteType }),

    EndString: (state: State, quoteType: Char.Type): Transition =>
        ({ kind: 'EndString', state, quoteType }),

    EscapeNext: (state: State): Transition =>
        ({ kind: 'EscapeNext', state }),
};




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Transition.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████
