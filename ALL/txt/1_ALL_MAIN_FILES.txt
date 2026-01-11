

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: index.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// ./index.ts

import { inspect, type InspectOptions } from 'node:util';
import type { Token } from './src/types/Tokenizer.types.ts';
import { Tokenizer } from './src/Tokenizer.ts';
import { Parser } from './src/Parser.ts';
import { CharacterStream } from './src/Character/CharacterStream.ts';
import { PrintLine } from './src/Logging.ts';

/**
 * @TODO Add character, token, and state support for quotes
 */

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
        breakLength: 40,
        compact: true,
        sorted: false,
        getters: false,
        numericSeparator: true,
    };

    console.log('\n=== TOKENIZATION & PARSING DEMO ===\n');

    for (const input of testCases) {
        // Step 1: Character stream
        const stream = new CharacterStream(input);

        // Step 1: Tokenize
        const tokenizer = new Tokenizer();
        const tokens = tokenizer
            .withLogging() //(`PARSER TEST:\n\nINPUT:\n\t'${input}'\n${'─'.repeat(80)}`)
            .tokenize(stream);

        // Step 2: Parse
        const parser = new Parser(tokens);
        const ast = parser.parse();
        // Step 3: Console log the AST
        console.log('\nAST:\n');
        const defaultAST = inspect(ast, inspectOptions);
        const fourSpaceAST = defaultAST.replace(/^ +/gm, match => ' '.repeat(match.length * 2));
        console.log(fourSpaceAST, '\n');
        PrintLine({ color: 'red' });
    }
}
/**
 * EXECUTE TESTS
 */

//characterStreamTest();

//tokenizerTest();
//tokenizerCommentsTest();

parserTest();




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: index.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: Consolidate.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// ./consolidate.ts

/**
 * @file consolidate.ts
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
import fs from 'node:fs';
import { globSync } from 'glob';
import path from 'node:path';
import { PrintLine, CenteredFiglet, Spacer, CenteredText, BoxText } from './src/Logging';
import { BoxType, LineType } from './src/types/Logging.types';

/**
 * Constants
 */
const TEXT_OUTPUT_DIR = './ALL/txt/';
const TS_OUTPUT_DIR = './ALL/ts/';
const START_END_SPACER = 30;
const START_END_NEWLINE = 2;
const FILE_DIVIDER_WIDTH = 100;
const UTF_8 = 'utf-8';

/**************************************************************************************************
 * 
 * CONFIGURATION
 * 
 *************************************************************************************************/

/**
 * @interface ConsolidationSourceDef
 * @description Defines the structure for a single consolidation task.
 * @property {string} jobName - A name for the job, used in output file name.
 * @property {string} name - A descriptive name for the job, used in logging.
 * @property {string[]} patterns - An array of glob patterns to find files for this job.
 */
interface ConsolidationSourceDef {
    jobName?: string;
    name: string;
    patterns: string[];
}

/**
 * @interface ConsolidationJob
 * @description Defines the structure for a single consolidation task.
 * @extends {ConsolidationSourceDef}
 * @property {string} outputFile - The path to the file where content will be consolidated.
 */
interface ConsolidationJob extends ConsolidationSourceDef {
    outputFile: string;
}

const SOURCE_DEFINITIONS: ConsolidationSourceDef[] = [
    {
        name: 'MAIN_FILES',
        jobName: 'Main Project TypeScript and JavaScript Files',
        patterns: [
            './src/**/*.ts',
            './src/**/*.js',
            './index.ts',
            './Consolidate.ts',
        ]
    },
    {
        name: 'CONFIG',
        jobName: 'Configuration Files and Markdown',
        patterns: [
            './.vscode/launch.json',
            './.vscode/settings.json',
            './.gitignore',
            './*.json',
            './*.config.ts',
            './git-push.sh',
        ]
    },
    {
        name: 'NEW_TEST',
        jobName: 'New Test Files',
        patterns: [
            './test/**/*.test.ts',
        ]
    },
    {
        name: 'OLD_TEST',
        jobName: 'Old Test Files',
        patterns: [
            './test_old/**/*.ts',
            './test_old/**/*.test.ts',
        ],
    },
    {
        name: 'MARKDOWN',
        jobName: 'Project Markdown Files',
        patterns: [
            './0. NOTES/*.md',
            './License',
            './README.md'
        ],
    },
];

const config = {
    /**
     * @description Generates an array of all consolidation jobs to be executed by the script.
     * @returns {ConsolidationJob[]}
     */
    generateJobsForType: (outputDir: string, extension: string): ConsolidationJob[] => {
        return SOURCE_DEFINITIONS.map((definition, index) => ({
            name: styleText(['red', 'underline'], definition.jobName ?? definition.name),
            outputFile: `${outputDir}${index + 1}_ALL_${definition.name.toUpperCase().replace(' ', '_')}.${extension}`,
            patterns: definition.patterns,
        }));
    },
    JOBS: [] as ConsolidationJob[],
};

/**
 * @description An array of all consolidation jobs to be executed by the script.
 * @type {ConsolidationJob[]}
 */
config.JOBS = [
    ...config.generateJobsForType(TS_OUTPUT_DIR, 'ts'),
    ...config.generateJobsForType(TEXT_OUTPUT_DIR, 'txt'),
];

/**************************************************************************************************
 * 
 * USER INTERFACE
 * 
 *************************************************************************************************/

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

const ui = {
    /**
     * @function displayHeader
     * @description Renders the main application header, including title and subtitle.
     * @returns {void}
     */
    displayHeader: (): void => {
        PrintLine({ preNewLine: true, lineType: LineType.boldBlock });
        console.log(styleText(['yellowBright', 'bold'], CenteredFiglet(`Consolidate!!!`)));
        CenteredText(styleText(['magentaBright', 'bold'], '*** PROJECT FILE CONSOLIDATOR SCRIPT ***'));
        PrintLine({ preNewLine: true, postNewLine: true, lineType: LineType.boldBlock });
    },

    /**
     * Logs the start of a new consolidation job.
     * @param {string} jobName - The name of the job being processed.
     * @param {string} outputFile - The path of the output file for the job.
     */
    logJobStart: (jobName: string, outputFile: string): void => {
        CenteredText(styleText('cyan', `Consolidating all project ${jobName}`));
        CenteredText(styleText('cyan', `files into ${outputFile}...\n`));
    },

    /**
     * Logs the path of a file being appended to an output file.
     * @param {string} filePath - The path of the file being appended.
     */
    logFileAppend: (filePath: string): void => {
        console.log(styleText('blue', `\tAppending:`), `${filePath}`);
    },

    /**
     * Logs a successful completion message for a job.
     */
    logComplete: (): void => {
        console.log();
        CenteredText(styleText(['yellow', 'bold'], 'Consolidation complete!!!'));
        PrintLine({ preNewLine: true, postNewLine: true, lineType: LineType.boldBlock });
    },

    /**
     * Logs a final summary message after all jobs are complete.
     * @param {number} fileCount - The total number of files consolidated.
     * @param {number} jobCount - The total number of jobs processed.
     */
    logFinalSummary: (fileCount: number, jobCount: number): void => {
        BoxText(
            `✓ Successfully consolidated ${fileCount} files across ${jobCount} jobs!`, { 
                boxType: BoxType.double,
                color: 'green',
                textColor: ['green', 'bold'] 
            }
        );
        PrintLine({ preNewLine: true, postNewLine: true, lineType: LineType.boldBlock });
    },
}

/**************************************************************************************************
 * 
 * FILE SYSTEM INTERACTION
 * 
 *************************************************************************************************/

const fileSystem = {
    /**
     * Ensures that a directory exists, creating it if necessary.
     * @param {string} dirPath - The path to the directory to create.
     */
    ensureDirectoryExists: (dirPath: string): void => {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    },

    /**
     * Ensures an output file is empty by deleting it if it already exists.
     * @param {string} filePath - The path to the output file to prepare.
     */
    prepareOutputFile: (filePath: string): void => {
        // Extract directory path and ensure it exists
        const dirPath = path.dirname(filePath);
        fileSystem.ensureDirectoryExists(dirPath);

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    },

    /**
     * Finds all file paths matching an array of glob patterns.
     * @param {string[]} patterns - The glob patterns to search for.
     * @param {string} outputFile - The path of the output file, to be excluded from the search.
     * @returns {string[]} An array of found file paths.
     */
    findFiles: (patterns: string[], outputFile: string): string[] => {
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
    },

    /**
     * Appends the content of a source file to an output file, wrapped with header and footer comments.
     * @param {string} outputFile - The path to the destination file.
     * @param {string} sourceFile - The path of the source file to append.
     */
    appendFileWithHeaders: (outputFile: string, sourceFile: string): void => {
        try {
            const space = Spacer(START_END_SPACER, '■');
            const endLine = Spacer(START_END_NEWLINE, '\n')

            // MARK FILE START
            const startFile = `${endLine}//${space} Start of file: ${sourceFile} ${space}${endLine}${endLine}\n`;
            fs.appendFileSync(outputFile, startFile, UTF_8);

            // ADD FILE CONTENT
            const content = fs.readFileSync(sourceFile, UTF_8);
            fs.appendFileSync(outputFile, content, UTF_8);

            // MARK FILE END
            const endFile = `\n${endLine}${endLine}//${space} End of file: ${sourceFile} ${space}${endLine}\n`;
            fs.appendFileSync(outputFile, endFile, UTF_8);

            // Add divider between files
            const divider = Spacer(FILE_DIVIDER_WIDTH, '█');
            const fileDivider = `//${divider}\n`;
            fs.appendFileSync(outputFile, fileDivider, UTF_8);
            fs.appendFileSync(outputFile, fileDivider, UTF_8);
        } catch (error) {
            console.error(styleText('red', `✗ Error processing ${sourceFile}:`), error);
            throw error;
        }
    },
}

/**************************************************************************************************
 * 
 * MAIN EXECUTION AND EXPORTS
 * 
 *************************************************************************************************/

const consolidateJobs = {
    /**
     * Processes a single consolidation job from start to finish.
     * @param {config.ConsolidationJob} job - The consolidation job to execute.
     * @private
     */
    process: (job: ConsolidationJob): number => {
        const { name, outputFile, patterns } = job;

        ui.logJobStart(name, outputFile);
        fileSystem.prepareOutputFile(outputFile);

        fileSystem.findFiles(patterns, outputFile)
            .forEach(sourceFile => {
                ui.logFileAppend(sourceFile);
                fileSystem.appendFileWithHeaders(outputFile, sourceFile);
            });

        ui.logComplete();
        return 1;
    },

    /**
     * Runs all consolidation jobs defined in the configuration.
     * @param {config.ConsolidationJob[]} jobs - An array of consolidation jobs to execute.
     */
    run: (jobs: ConsolidationJob[]): void => {
        let totalFiles = 0;
        jobs.forEach(job => {
            const count = consolidateJobs.process(job);
            totalFiles += count;
        });
        ui.logFinalSummary(totalFiles, jobs.length);
    },
}

/**
 * @function main
 * @description The main entry point for the script. Initializes the UI and 
 *              starts the consolidation process.
 */
export const main = (): void => {
    ui.displayHeader();
    consolidateJobs.run(config.JOBS);
};

// Executes and exports the script.
const consolidate = main;

export default consolidate;

consolidate();




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: Consolidate.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Logging.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/PrintLine.ts

import { styleText } from 'node:util';
import figlet from 'figlet';
import standard from "figlet/fonts/Standard";
import {    
    type PrintLineOptions,
    LineType, 
    type BoxTextOptions, 
    BoxType, 
    BoxStyles,
    Width, 
    Align, 
    Color,
    Themes,
    Style 
} from './types/Logging.types';

const MAX_WIDTH: number = 80;
const TAB_WIDTH: number = 4;
const SPACE: string = ' ';
const FIGLET_FONT = 'Standard';
figlet.parseFont(FIGLET_FONT, standard);

/**
 * @function Spacer
 * @description Creates a string of repeated characters, useful for padding.
 * @param {number} [width=TAB_WIDTH] - Number of characters to repeat.
 * @param {string} [char=SPACE] - The character to repeat.
 * @returns {string} A string of repeated characters.
 */
const Spacer = (width: number = TAB_WIDTH, char: string = SPACE): string => char.repeat(width);

/**
 * @function CenterText
 * @description Centers a line of text within a given width by adding padding.
 * @param {string} text - The text to center.
 * @param {number} [width=MAX_WIDTH] - The total width to center within.
 * @returns {string} The centered text string.
 * @requires spacer - Function that return a string for spacing.
 */
const CenterText = (text: string, width: number = MAX_WIDTH): string => {
    // Remove any existing styling for accurate length calculation
    const unstyledText = text.replace(/\x1b\[[0-9;]*m/g, '');
    const padding = Math.max(0, Math.floor((width - unstyledText.length) / 2));
    return `${Spacer(padding)}${text}`;
};

/**
 * @function CenteredFiglet
 * @description Generates and centers multi-line FIGlet (ASCII) text.
 * @param {string} text - The text to convert to ASCII art.
 * @param {number} [width=MAX_WIDTH] - The total width to center the art within.
 * @returns {string} The centered, multi-line ASCII art as a single string.
 * @requires centerText
 */
const CenteredFiglet = (text: string, width: number = MAX_WIDTH): string => {
    const rawFiglet = figlet.textSync(text, {
        font: FIGLET_FONT,
        width: width,
        whitespaceBreak: true
    });

    return rawFiglet.split('\n')
        .map(line => CenterText(line, width))
        .join('\n');
}

/**
 * @function PrintLine
 * @description Outputs a styled horizontal line to the console.
 * @param {PrintLineOptions} [options={}] - Configuration options for the line.
 * @returns {string}
 */
const PrintLine = (options: PrintLineOptions = {}): string => {
    /**
     * @description Default options object for the printLine function.
     */
    const defaultOptions: PrintLineOptions = {
        preNewLine: false,
        postNewLine: false,
        width: MAX_WIDTH,
        lineType: LineType.double,
        color: [Color.gray, Style.bold],
        textAlign: Align.center,
    } as const;

    const themeOptions = options.theme ? (Themes as any)[options.theme] : {};
    const mergedOptions = {
        ...defaultOptions,
        ...themeOptions,
        ...options
    };
    const {
        width,
        preNewLine,
        postNewLine,
        lineType,
        color,
        bgColor,
        gradient,
        styles,
        text,
        textColor,
        textAlign,
    } = mergedOptions;

    const colorStyles = color ? (Array.isArray(color) ? color : [color]) : [];
    const bgColorStyles = bgColor ? (Array.isArray(bgColor) ? bgColor : [bgColor]) : [];
    const otherStyles = styles || [];
    const lineStyles = [...colorStyles, ...bgColorStyles, ...otherStyles];
    const textStyles = textColor ? (Array.isArray(textColor) ? textColor : [textColor]) : lineStyles;
    const pre = preNewLine ? '\n' : '';
    const post = postNewLine ? '\n' : '';
    let finalOutput: string;

    if (gradient) {
        const [startColor, endColor] = gradient;
        const halfWidth = Math.floor(width! / 2);

        const startSegment = styleText([startColor], lineType!.repeat(halfWidth));
        const endSegment = styleText([endColor], lineType!.repeat(width! - halfWidth));

        const styledDivider = startSegment + endSegment;

        const result = `${pre}${styledDivider}${post}`;
        console.log(result);
        return result;
    }


    if (!text) {
        // Simple case: No text, just style the whole line as before.
        finalOutput = styleText(lineStyles, lineType!.repeat(width!));
    } else {
        // Advanced case: Text exists, so build the line in pieces.
        const paddedText = ` ${text} `; // Add padding

        // Style the text separately
        const styledText = styleText(textStyles, paddedText);

        const lineCharCount = width! - paddedText.length;
        if (lineCharCount < 0) {
            // If the text is too long, just print the styled text.
            finalOutput = styledText;
        } else {
            // Otherwise, calculate and style the line segments.
            switch (textAlign) {
                case 'left': {
                    const rightLine = styleText(lineStyles, lineType!.repeat(lineCharCount));
                    finalOutput = styledText + rightLine;
                    break;
                }
                case 'right': {
                    const leftLine = styleText(lineStyles, lineType!.repeat(lineCharCount));
                    finalOutput = leftLine + styledText;
                    break;
                }
                case 'center':
                default: {
                    const leftCount = Math.floor(lineCharCount / 2);
                    const rightCount = lineCharCount - leftCount;
                    const leftLine = styleText(lineStyles, lineType!.repeat(leftCount));
                    const rightLine = styleText(lineStyles, lineType!.repeat(rightCount));
                    finalOutput = leftLine + styledText + rightLine;
                    break;
                }
            }
        }
    }

    // 5. Log the final constructed string
    const result = `${pre}${finalOutput}${post}`;
    console.log(result);
    return result;
};

/**
 * @function BoxText
 * @description Draws a styled ASCII box around a given text string and prints it to the console.
 * @param {string | string[]} text - The text to be enclosed in the box.
 * @param {BoxTextOptions} [options={}] - Configuration options for the box.
 * @returns {string}
 */
const BoxText = (text: string | string[], options: BoxTextOptions = {}): void => {
    /**
     * @description Default options object for the printLine function.
     */
    const defaultOptions: BoxTextOptions = {
        width: Width.tight,
        preNewLine: false,
        postNewLine: false,
        boxType: BoxType.single,
        boxAlign: Align.center,
        color: [Color.gray, Style.bold],
        textColor: Color.white,       
    } as const;

    const themeOptions = options.theme ? (Themes as any)[options.theme] : {};
    const mergedOptions = {
        ...defaultOptions,
        ...themeOptions,
        ...options
    };
    const {
        width,
        preNewLine,
        postNewLine,
        boxType,
        boxAlign,
        color,
        bgColor,
        textColor,
        textBgColor,
        styles,
    } = mergedOptions;

    const boxChars = (BoxStyles as any)[boxType];

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
        ...(styles || []),
    ];


    // --- 3. Calculate Content Width and Wrap Text ---
    let contentWidth: number;
    let textLines: string[];

    // Add this helper inside BoxText, right after the options destructuring
    const stripAnsi = (str: string): string => str.replace(/\x1b\[[0-9;]*m/g, '');

    if (Array.isArray(text)) {
        textLines = text;
        contentWidth = Math.max(...textLines.map(line => stripAnsi(line).length));

        // If a fixed width is requested, we use it instead of the longest line
        if (typeof width === 'number') {
            contentWidth = width - 4;
        } else if (width === 'max') {
            contentWidth = MAX_WIDTH - 4;
        }
    } else {
        // --- Existing logic for single strings ---
        if (width === 'max') {
            contentWidth = MAX_WIDTH - 4;
        } else if (typeof width === 'number') {
            if (width <= 4) throw new Error('Custom width must be greater than 4.');
            contentWidth = width - 4;
        } else {
            textLines = text.split('\n');
            contentWidth = Math.max(...textLines.map(line => line.length));
        }

        // Word-wrap if width is constrained
        if (width !== 'tight') {
            const words = text.split(/\s+/);
            textLines = words.reduce((lines, word) => {
                if (lines.length === 0) return [word];
                let lastLine = lines[lines.length - 1]!;
                if ((lastLine.length + word.length + 1) > contentWidth) {
                    lines.push(word);
                } else {
                    lines[lines.length - 1] = lastLine + ' ' + word;
                }
                return lines;
            }, [] as string[]);
        } else {
            textLines = text.split('\n');
        }
    }


    // --- NEW: Calculate Outer Alignment Padding ---
    const fullBoxWidth = contentWidth + 4; // Border(1) + Space(1) + Content + Space(1) + Border(1)
    let leftPaddingAmount = 0;

    if (boxAlign === 'center') {
        leftPaddingAmount = Math.max(0, Math.floor((MAX_WIDTH - fullBoxWidth) / 2));
    } else if (boxAlign === 'right') {
        leftPaddingAmount = Math.max(0, MAX_WIDTH - fullBoxWidth);
    }

    const outerPadding = ' '.repeat(leftPaddingAmount);

    // --- Build Box Components ---
    const centerAlign = (str: string, width: number): string => {
        const padding = Math.floor((width - str.length) / 2);
        return ' '.repeat(padding) + str + ' '.repeat(width - str.length - padding);
    };

    const styledTop = styleText(boxFinalStyles, boxChars.tl + boxChars.t.repeat(contentWidth + 2) + boxChars.tr);
    const styledBottom = styleText(boxFinalStyles, boxChars.bl + boxChars.b.repeat(contentWidth + 2) + boxChars.br);
    const styledLeftBorder = styleText(boxFinalStyles, boxChars.l + ' ');
    const styledRightBorder = styleText(boxFinalStyles, ' ' + boxChars.r);

    // Assemble lines with outer padding
    const styledContentLines = textLines!.map(line => {
        const centeredText = centerAlign(line, contentWidth);
        const styledText = styleText(textFinalStyles, centeredText);
        return outerPadding + styledLeftBorder + styledText + styledRightBorder;
    });

    const fullBoxString = [
        outerPadding + styledTop,
        ...styledContentLines,
        outerPadding + styledBottom
    ].join('\n');

    const pre = preNewLine ? '\n' : '';
    const post = postNewLine ? '\n' : '';
    console.log(`${pre}${fullBoxString}${post}`);
};

const CenteredText = (text: string): void => {
    console.log(CenterText(text));
}

export {
    Themes,
    Spacer,
    CenterText,
    CenteredText,
    CenteredFiglet,
    PrintLine,
    BoxText,
}





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Logging.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Parser.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/Parser.ts

import { type Token, TokenType } from './types/Tokenizer.types.ts';
import { NodeType } from './types/Parser.types.ts';
import type {
    Statement, Expression, VariableDeclarationKind, BaseNode,
    SourcePosition, Program, ExpressionStatement, VariableDeclaration,
    Identifier, StringLiteral, NumericLiteral, HexLiteral, PercentLiteral,
    DimensionLiteral, BinaryExpression, UnaryExpression, CallExpression,
    GroupExpression, SeriesExpression, AssignmentExpression, DimensionKind,
    ColorFunctionKind,
} from './types/Parser.types.ts';

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
    private currentIndex: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens.filter(t =>
            t.type !== TokenType.WHITESPACE &&
            t.type !== TokenType.NEWLINE
        );
    }

    public parse(): Program {
        // Capture the very first token for the start position.
        const start = this.peek().position.start;
        const statements: Statement[] = [];

        while (!this.isAtEnd()) {
            statements.push(this.declaration());
        }

        // Capture the last token consumed for the end position.
        // If the file is empty, this will be the same as the start.
        const end = this.tokens.length > 0 ? this.previous().position.end : start;

        return {
            type: NodeType.Program,
            body: statements,
            position: { start, end },
        };
    }

    private declaration(): Statement {
        let stmt: Statement;

        // We check for a keyword WITHOUT consuming it first.
        if (this.check(TokenType.KEYWORD)) {
            const keyword = this.peek().value;

            // Check if the keyword is one we use for declarations
            if (this.isVariableDeclarationKind(keyword)) {
                // Now consume the keyword
                this.advance();
                // Assign the parsed statement to our variable instead of returning early
                stmt = this.variableDeclaration(keyword as VariableDeclarationKind);
            }
            //if (this.isColorFunctionKind(keyword)) {
            //    this.advance();
            //    stmt = this.statement();
            //}

            else {
                // If it's a keyword but not for a declaration (e.g. 'return' in the future),
                // treat it as a regular statement for now.
                stmt = this.statement();
            }
        }

        /**
         * Add future statment checks here
         */

        else {
            // If it's not a declaration keyword or not a keyword at all,
            // parse it as a simple expression statement.
            stmt = this.statement();
        }

        // After any statement, optionally consume a semicolon.
        this.match(TokenType.SEMICOLON);

        return stmt;
    }

    private variableDeclaration(kind: VariableDeclarationKind): VariableDeclaration {
        const start = this.peek().position.start;
        const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name.').value;

        this.consume(TokenType.EQUALS, "Expect '=' after variable name.");

        const initializer = this.expression();

        // Assuming you have a Semicolon token type or will handle it
        // this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
        const end = this.tokens.length > 0 ? this.previous().position.end : start;
        return {
            type: NodeType.VariableDeclaration,
            kind,
            identifier: { type: NodeType.Identifier, name },
            initializer,
            position: { start, end },
        };
    }

    private statement(): Statement {
        return this.expressionStatement();
    }

    private expressionStatement(): ExpressionStatement {
        const start = this.peek().position.start;
        const expr = this.expression();
        const end = this.tokens.length > 0 ? this.previous().position.end : start;
        return {
            type: NodeType.ExpressionStatement,
            expression: expr,
            position: { start, end },
        };
    }

    private expression(): Expression {
        return this.assignment();
    }

    private assignment(): Expression {
        // Parse the expression on the left, which might be a variable name
        const expr = this.series();

        // If the token that follows is an '=', we have an assignment
        if (this.match(TokenType.EQUALS)) {
            const equals = this.previous(); // The '=' token, for error reporting
            // Recursively call assignment() to handle right-associativity (e.g., a = b = 5)
            const right = this.assignment();

            // The left-hand side of an assignment must be a valid target.
            // For now, we'll just check if it's an Identifier.
            if (expr.type === NodeType.Identifier) {
                return {
                    type: NodeType.AssignmentExpression,
                    left: expr,
                    right: right,
                    position: {
                        start: expr.position.start,
                        end: right.position.end
                    }
                } as AssignmentExpression;
            }

            // If you try to do something like `5 = 10`, this error will be thrown.
            throw this.error(equals, "Invalid assignment target.");
        }

        // If there was no '=', it's not an assignment, so just return the expression we parsed.
        return expr;
    }

    private series(): Expression {
        let expr = this.addition();

        if (this.match(TokenType.COMMA)) {
            const expressions = [expr];

            while (this.check(TokenType.COMMA)) {
                this.consume(TokenType.COMMA, "Expected comma in series.");
                expressions.push(this.addition());
            }

            // Guard against empty array (should never happen, but TypeScript doesn't know that)
            if (expressions.length === 0) {
                throw new Error("Series expression cannot be empty");
            } else {

                const start = expressions[0]!.position.start;
                const end = expressions[expressions.length - 1]!.position.end;

                expr = {
                    type: NodeType.SeriesExpression,
                    expressions: expressions,
                    position: { start, end }
                } as SeriesExpression;
            }
        }

        return expr;
    }

    private addition(): Expression {
        // Parse the left-hand side first. It contains the starting position.
        let expr = this.multiplication();

        while (
            !this.isAtEnd() &&
            this.match(TokenType.PLUS, TokenType.MINUS)
        ) {
            const operator = this.previous().value as '+' | '-';
            const right = this.multiplication();

            // The new node starts where the left side started,
            // and ends where the right side ends.
            expr = {
                type: NodeType.BinaryExpression,
                operator,
                left: expr,
                right,
                position: {
                    start: expr.position.start, // Start of the original left expression
                    end: right.position.end      // End of the new right expression
                }
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
                position: {
                    start: expr.position.start,
                    end: right.position.end
                }
            } as BinaryExpression;
        }

        return expr;
    }

    private unary(): Expression {
        if (
            !this.isAtEnd() &&
            this.match(TokenType.PLUS, TokenType.MINUS)
        ) {
            const operatorToken = this.previous();
            const operator = operatorToken.value as '+' | '-';
            const argument = this.unary();
            return {
                type: NodeType.UnaryExpression,
                operator,
                argument,
                position: {
                    start: operatorToken.position.start,
                    end: argument.position.end
                }
            } as UnaryExpression;
        }

        return this.call();
    }

    private call(): Expression {
        let expr = this.primary();

        if (
            expr &&
            expr.type === NodeType.Identifier &&
            this.match(TokenType.LPAREN)
        ) {
            const args: Expression[] = [];

            // Parse arguments WITHOUT going through series
            while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) {
                // Skip comma if present
                if (this.check(TokenType.COMMA)) {
                    this.advance();
                    continue;
                }

                // Use addition() instead of expression() to skip series handling
                const arg = this.addition();
                if (arg) args.push(arg);
            }

            this.consume(TokenType.RPAREN, "Expected ')' after arguments");

            expr = {
                type: NodeType.CallExpression,
                callee: expr as Identifier,
                arguments: args,
                position: {
                    start: expr.position.start,
                    end: this.previous().position.end,
                },
            } as CallExpression;
        }

        return expr as Expression;
    }

    private primary(): Expression {
        let token = this.peek();

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

        token = this.peek();

        switch (token.type) {
            case TokenType.FUNCTION:
            case TokenType.IDENTIFIER: {
                this.advance();
                const token = this.previous();
                return {
                    type: NodeType.Identifier,
                    name: token.value,
                    position: { 
                        start: token.position.start, 
                        end: token.position.end 
                    },
                } as Identifier;
            }

            case TokenType.LPAREN: {
                const startToken = this.peek();
                this.advance();
                const expr = this.expression();
                const endToken = this.consume(TokenType.RPAREN, "Expected ')' after expression");
                return {
                    type: NodeType.GroupExpression,
                    expression: expr,
                    position: {
                        start: startToken.position.start, // Position of '('
                        end: endToken.position.end      // Position of ')'
                    },
                } as GroupExpression;
            }

            default:
                throw this.error(token, `Expected expression, got ${token.type}`);
        }
    }

    private createLiteralNode(token: Token): Expression {
        const position = {
            start: token.position.start,
            end: token.position.end
        };

        switch (token.type) {
            case TokenType.STRING: {
                return {
                    type: NodeType.StringLiteral,
                    value: token.value,
                    raw: `"${token.value}"`,
                    position,
                } as StringLiteral;
            }

            case TokenType.NUMBER: {
                return {
                    type: NodeType.NumericLiteral,
                    value: parseFloat(token.value),
                    raw: token.value,
                    position,
                } as NumericLiteral;
            }

            case TokenType.PERCENT: {
                const numStr = token.value.replace('%', '');
                return {
                    type: NodeType.PercentLiteral,
                    value: parseFloat(numStr),
                    raw: token.value,
                    position,
                } as PercentLiteral;
            }

            case TokenType.DIMENSION: {
                const match = token.value.match(/^([\d.]+)([a-zA-Z]+)$/);
                if (match && match[1] && match[2]) {
                    if (!this.isDimensionKind(match[2])) {
                        throw this.error(token, `Invalid dimension format for '${token.value}'. '${match[2]}' is not a valid dimension.`);
                    }
                    return {
                        type: NodeType.DimensionLiteral,
                        value: parseFloat(match[1]),
                        unit: match[2],
                        raw: token.value,
                        position,
                    } as DimensionLiteral;
                } else {
                    throw this.error(token, `Invalid dimension format for '${token.value}'`);
                }
            }

            case TokenType.HEXVALUE: {
                return {
                    type: NodeType.HexLiteral,
                    value: token.value,
                    raw: token.value,
                    position,
                } as HexLiteral;
            }

            default:
                throw this.error(token, `Expected expression, got ${token.type}`);
        }
    }

    /**
     * Helper Methods
     */

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
        return this.peek().type === type;
    }

    private advance(): Token {
        this.currentIndex++;

        while (!this.isAtEnd() && this.isIgnored(this.peek())) {
            this.currentIndex++;
        }
        return this.previous();
    }

    private isIgnored(token: Token): boolean {
        return token.type === TokenType.WHITESPACE || token.type === TokenType.NEWLINE;
    }

    private isAtEnd(): boolean {
        return this.currentIndex >= this.tokens.length || this.peek().type === TokenType.END;
    }

    private isVariableDeclarationKind(value: string): value is VariableDeclarationKind {
        return value === 'const' || value === 'let' || value === 'var';
    }

    private isDimensionKind(value: string): value is DimensionKind {
        return value === 'deg' ||
            value === 'grad' ||
            value === 'rad' ||
            value === 'turn';
    }

    private isColorFunctionKind(value: string): value is ColorFunctionKind {
        return value === 'rgb' ||
            value === 'rgba' ||
            value === 'hsl' ||
            value === 'hsla' ||
            value === 'hwb' ||
            value === 'lab' ||
            value === 'lch' ||
            value === 'oklab' ||
            value === 'oklch' ||
            value === 'ictcp' ||
            value === 'jzazbz' ||
            value === 'jzczhz' ||
            value === 'alpha' ||
            value === 'color';
    }

    private peek(): Token {
        return this.tokens[this.currentIndex] as Token;
    }

    private previous(n: number = 1): Token {
        return this.tokens[this.currentIndex - n] as Token;
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw this.error(this.peek(), message);
    }

    private error(token: Token, message: string): Error {
        return new Error(`Parse error at '${token.value}': ${message}`);
    }
}





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Parser.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Tokenizer.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/Tokenizer.ts

import { TokenType, type Token, type CreateTokenFn } from './types/Tokenizer.types.ts';

import { styleText, inspect, type InspectOptions } from 'node:util';
import { Context } from './Context.ts';
import { CharacterStream, type Position, type Character } from './Character/CharacterStream.ts';
import { PrintLine, Spacer, CenterText, BoxText } from './Logging.ts';
import { State } from './types/Context.types.ts';
import { BoxType } from './types/Logging.types.ts';

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
    private message = 'TOKENIZATION DEMONSTRATION:';

    constructor() {
        return this.reset();
    }

    private get state(): State {
        return this.ctx.state;
    }

    /**
     * Resets the tokenizer's internal state for a new run.
     */
    private reset(): this {
        this.ctx.reset();
        this.buffer = [];
        return this;
    }

    /**
     * A map of recognized keywords. Used to convert IDENTIFIER tokens into KEYWORD tokens.
     */
    private static readonly KEYWORDS: Record<string, TokenType> = {
        'rgb': TokenType.FUNCTION,
        'rgba': TokenType.FUNCTION,
        'hsl': TokenType.FUNCTION,
        'hsla': TokenType.FUNCTION,
        'hwb': TokenType.FUNCTION,
        'lch': TokenType.FUNCTION,
        'lab': TokenType.FUNCTION,
        'oklch': TokenType.FUNCTION,
        'oklab': TokenType.FUNCTION,
        'alpha': TokenType.FUNCTION,
        'color': TokenType.FUNCTION,
        'from': TokenType.FUNCTION,
        'deg': TokenType.DIMENSION,
        'grad': TokenType.DIMENSION,
        'rad': TokenType.DIMENSION,
        'turn': TokenType.DIMENSION,
        'const': TokenType.KEYWORD,
        'let': TokenType.KEYWORD,
        'for': TokenType.KEYWORD,
        'of': TokenType.KEYWORD,
        'new': TokenType.KEYWORD,
        'red': TokenType.KEYWORD,
        'green': TokenType.KEYWORD,
        'blue': TokenType.KEYWORD,
    };

    /**
     * Maps the first character of a generic SYMBOL token to a specific TokenType.
     */
    private static readonly SYMBOLS: Record<string, TokenType> = {
        '=': TokenType.EQUALS,
        '+': TokenType.PLUS,
        '-': TokenType.MINUS,
        '*': TokenType.STAR,
        '.': TokenType.DOT,
        ',': TokenType.COMMA,
        '/': TokenType.SLASH,
        '(': TokenType.LPAREN,
        ')': TokenType.RPAREN,
        '%': TokenType.PERCENT,
        ';': TokenType.SEMICOLON,
        // Add other single-character symbols here
    };

    /**
     * Maps the final state of the context to a TokenType.
     * @param {State} state - The context state.
     * @returns {TokenType} The corresponding token type.
     */
    private static readonly STATETOKEN_MAP: Partial<Record<State, TokenType>> = {
        [State.IN_IDENTIFIER]: TokenType.IDENTIFIER,
        [State.IN_NUMBER]: TokenType.NUMBER,
        [State.IN_STRING]: TokenType.STRING,
        [State.IN_HEXVALUE]: TokenType.HEXVALUE,
        [State.IN_DIMENSION]: TokenType.DIMENSION,
        [State.IN_PERCENT]: TokenType.PERCENT,
        [State.IN_SYMBOL]: TokenType.SYMBOL,
        [State.IN_SINGLE_LINE_COMMENT]: TokenType.COMMENT,
        [State.IN_MULTI_LINE_COMMENT]: TokenType.COMMENT,
        [State.IN_MULTI_LINE_COMMENT_SAW_STAR]: TokenType.COMMENT,
    };

    /**
     * Tokenizes a given character stream.
     * @param {Stream} stream - The input stream to tokenize.
     * @returns {Token[]} An array of tokens.
     */
    public tokenize(stream: CharacterStream): Token[] {
        this.reset();
        const tokens: Token[] = [];
        let reprocess = false;
        this.logHeader(stream);

        for (const CHAR of stream) {
            do {
                const ACTION = this.ctx.process(CHAR);
                reprocess = ACTION.reprocess;

                if (ACTION.emit && this.buffer.length > 0) {
                    const tokenType = (this.state === State.INITIAL)
                        ? ACTION.tokenType
                        : Tokenizer.STATETOKEN_MAP[this.state] ?? TokenType.OTHER;

                    tokens.push(this.createToken(tokenType));
                    this.buffer = [];
                }

                if (!ACTION.ignore && !reprocess) this.buffer.push(CHAR);

            } while (reprocess);
        }

        if (this.buffer.length > 0) {
            const newState = Tokenizer.STATETOKEN_MAP[this.state] ?? TokenType.OTHER;
            tokens.push(this.createToken(newState));
        }

        // Create END token with proper position
        const lastChar = stream.lookback();
        const endPos = lastChar?.position ?? { index: 0, line: 1, column: 1 };
        tokens.push({
            value: '',
            type: TokenType.END,
            position: { start: endPos, end: endPos }
        });

        this.logResults(tokens);
        return tokens;
    }

    private static createTOKENMAP(start: Position, end: Position): Partial<Record<TokenType, CreateTokenFn>> {
        return {
            [TokenType.STRING]: (value) => {
                return {
                    value: Tokenizer.unescapeString(value),
                    type: TokenType.STRING,
                    position: { start, end }
                };
            },
            [TokenType.IDENTIFIER]: (value) => {
                return {
                    value,
                    type: Tokenizer.KEYWORDS[value] ?? TokenType.IDENTIFIER,
                    position: { start, end }
                };
            },
            [TokenType.SYMBOL]: (value) => {
                return {
                    value,
                    type: Tokenizer.SYMBOLS[value] ?? TokenType.SYMBOL,
                    position: { start, end }
                };
            },
            [TokenType.COMMENT]: (value) => {
                return {
                    value,
                    type: TokenType.COMMENT,
                    position: { start, end }
                };
            }
        };
    }

    /**
     * Creates a token from the current buffer and a given type.
     * This is where keyword checking and string unescaping happens.
     * @param {TokenType} tokenType - The type of token to create, as determined by the Context.
     * @returns {Token} The final token.
     */
    private createToken(tokenType: TokenType): Token {
        if (this.buffer.length === 0) throw new Error('Cannot create token from empty buffer');

        // Capture start from first character, end from last character
        const start: Position = this.buffer[0]!.position;
        const end: Position = this.buffer[this.buffer.length - 1]!.position;

        let value = this.buffer.map(c => c.value).join('');

        if (tokenType === TokenType.COMMENT && value.startsWith('/*')) {
            value += '/';
        }

        const otherToken: CreateTokenFn = (newValue: string, newType?: TokenType) => {
            return {
                value: newValue,
                type: newType ?? TokenType.OTHER,
                position: { start, end }
            };
        }

        const tokenMap = Tokenizer.createTOKENMAP(start, end);
        const tokenFn = tokenMap[tokenType] ?? otherToken;
        return tokenFn(value, tokenType, start, end);
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

    public withLogging(message?: string): this {
        this.shouldLog = true;
        if (message) this.message = message;
        return this;
    }

    public withoutLogging(): this {
        this.shouldLog = false;
        this.message = '';
        return this;
    }

    private logHeader(stream: CharacterStream): void {
        if (!this.shouldLog) return;
        PrintLine({
            preNewLine: false,
            postNewLine: true,
            color: 'red',
            textColor: 'magenta',
            text: this.message,
        });
        console.log(CenterText(styleText('yellow', 'SOURCE:\n')));
        BoxText(stream.get(), {
            width: 50,
            boxType: BoxType.double,
            textColor: 'yellow',
        });
        PrintLine({ preNewLine: true, postNewLine: true });
    }

    private logResults(tokens: Token[]): void {
        if (!this.shouldLog) return;

        console.log(styleText('yellow', 'RESULT (TOKENS):'));

        for (const token of tokens) {
            console.log(`${Spacer(3)}${inspect(token, this.inspectOptions)}`);
        }

        PrintLine({ preNewLine: true, postNewLine: false, color: 'red' });
        this.shouldLog = false;
        this.message = '';
    }
}

export {
    Tokenizer
}





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Tokenizer.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Context.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/Context.ts

import { CharType, type Character } from './Character/CharacterStream.ts';
import { State, type Action, type QuoteType } from './types/Context.types.ts';
import { TokenType } from './types/Tokenizer.types.ts';

/**
 * The Context class is a state machine that tracks the current tokenizing state.
 * It receives characters one by one and tells the Tokenizer how to handle them.
 */
class Context {
    private _state: State = State.INITIAL;
    private quoteType: QuoteType | null = null;

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
    public get state(): State {
        return this._state;
    }

    /**
     * Sets the current state of the context.
     * @param {State} value The new current state.
     */
    public set state(value: State) {
        this._state = value ?? State.INITIAL;
    }

    /**
     * Transitions the current state of the context.
     * @param {State} value The new current state.
     */
    public transitionTo(value: State): void {
        this._state = value ?? State.INITIAL;
    }

    private readonly STATEPROCESS_MAP: Partial<Record<State, (char: Character) => Action>> = {
        [State.INITIAL]: (char) => this.processInitial(char),
        [State.IN_IDENTIFIER]: (char) => this.processIdentifier(char),
        [State.IN_HEXVALUE]: (char) => this.processHex(char),
        [State.IN_NUMBER]: (char) => this.processNumber(char),
        [State.IN_DIMENSION]: (char) => this.processDimension(char),
        [State.IN_PERCENT]: (char) => this.processPercent(char),
        [State.IN_STRING]: (char) => this.processString(char),
        [State.IN_ESCAPE]: (char) => this.processEscape(char),
        [State.IN_SYMBOL]: (char) => this.processSymbol(char),
        [State.SEEN_SLASH]:                     (char) => this.processSeenSlash(char),
        [State.IN_SINGLE_LINE_COMMENT]:         (char) => this.processSingleLineComment(char),
        [State.IN_MULTI_LINE_COMMENT]:          (char) => this.processMultiLineComment(char),
        [State.IN_MULTI_LINE_COMMENT_SAW_STAR]: (char) => this.processMultiLineCommentSawStar(char),
    };

    /**
     * The core processing logic of the state machine.
     * @param char The character to process.
     * @returns {Action} The action for the Tokenizer to take.
     */
    public process(char: Character): Action {
        const processFn = this.STATEPROCESS_MAP[this.state];
        if (processFn) return processFn(char);

        this.transitionTo(State.INITIAL);
        return { emit: false, reprocess: true, ignore: true, tokenType: TokenType.OTHER };
    }

    // Handles characters when in the initial state (between tokens).
    private processInitial(char: Character): Action {
        switch (char.type) {
            case CharType.Letter:
                this.transitionTo(State.IN_IDENTIFIER);
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.IDENTIFIER };

            case CharType.Number:
                this.transitionTo(State.IN_NUMBER);
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.NUMBER };

            case CharType.Hash:
                this.transitionTo(State.IN_HEXVALUE);
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.HEXVALUE };

            case CharType.Slash:
                this.transitionTo(State.SEEN_SLASH);
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };

            case CharType.Backtick:
            case CharType.SingleQuote:
            case CharType.DoubleQuote:
                this.quoteType = char.type as QuoteType;
                this.transitionTo(State.IN_STRING);
                return { emit: false, reprocess: false, ignore: true, tokenType: TokenType.STRING };

            case CharType.Whitespace:
            case CharType.NewLine:
            case CharType.EOF:
                return { emit: false, reprocess: false, ignore: true, tokenType: TokenType.OTHER };

            default:
                this.transitionTo(State.IN_SYMBOL);
                return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.SYMBOL };
        }
    }

    // Handles characters when building an identifier.
    private processIdentifier(char: Character): Action {
        if (char.type === CharType.Letter || char.type === CharType.Number) {
            // Continue building the identifier.
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.IDENTIFIER };
        }
        // End of identifier. Emit it and reprocess the current char in the INITIAL state.
        this.transitionTo(State.INITIAL);
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.IDENTIFIER };
    }

    // Handles characters when building a number.
    private processNumber(char: Character): Action {
        // If we see a number or a dot, continue building the NUMBER.
        if (char.type === CharType.Number || char.type === CharType.Dot) {
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.NUMBER };
        }

        // Transition to IN_DIMENSION if a letter is found
        if (char.type === CharType.Letter) {
            this.transitionTo(State.IN_DIMENSION);
            // Continue buffering this character as part of the new dimension token.
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.DIMENSION };
        }

        // If we see a percent sign, transition to the IN_PERCENTAGE state.
        if (char.type === CharType.Percent) {
            this.transitionTo(State.IN_PERCENT);
            // Tell the tokenizer to keep buffering, as this '%' is part of our token.
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.PERCENT };
        }

        // For any other character, the number is finished.
        this.transitionTo(State.INITIAL);
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.NUMBER };
    }

    // Handles the token when a dimension arrives.
    private processDimension(char: Character): Action {
        // Continue consuming as long as we see letters.
        if (char.type === CharType.Letter) {
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.DIMENSION };
        }
        // Any other character ends the dimension. Emit and reprocess.
        this.transitionTo(State.INITIAL);
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.DIMENSION };
    }

    // Handles the token when the character *after* the '%' arrives.
    private processPercent(char: Character): Action {
        // The percentage token is complete as soon as we see any new character.
        this.transitionTo(State.INITIAL);
        // Emit the buffered "56%" and reprocess the new character.
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.PERCENT };
    }

    // Handles characters when building a hex value.
    private processHex(char: Character): Action {
        // FIX: The regex was incorrect. It should not contain extra brackets.
        if (char.type === CharType.Number ||
            (char.type === CharType.Letter && /^[0-9a-fA-F]$/i.test(char.value))) {
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.HEXVALUE };
        }

        // Any other character ends the hex value. Emit and reprocess.
        this.transitionTo(State.INITIAL);
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.HEXVALUE };
    }

    // Handles characters when inside a string.
    private processString(char: Character): Action {
        // If we see a backslash, set the escape flag for the *next* character.
        if (char.type === CharType.BackSlash) {
            this.transitionTo(State.IN_ESCAPE);
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.STRING };
        }

        // If we see the matching closing quote (and it was not escaped), the string ends.
        if (char.type === this.quoteType) {
            this.transitionTo(State.INITIAL);
            this.quoteType = null;
            return { emit: true, reprocess: false, ignore: true, tokenType: TokenType.STRING };
        }

        // Any other character is just content to be buffered.
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.STRING };
    }

    // Handles the character AFTER a '/'
    private processSeenSlash(char: Character): Action {
        if (char.type === CharType.Slash) {
            // It's a single-line comment. Keep consuming.
            this.transitionTo(State.IN_SINGLE_LINE_COMMENT);
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
        }
        if (char.type === CharType.Star) {
            // It's a multi-line comment. Keep consuming.
            this.transitionTo(State.IN_MULTI_LINE_COMMENT);
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
        }

        // It was a false alarm. The previous '/' was just a division operator.
        this.transitionTo(State.INITIAL);
        // Emit the buffered '/' as a SLASH token, then reprocess the current character.
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.SLASH };
    }

    // Handles '//' comments
    private processSingleLineComment(char: Character): Action {
        if (char.type === CharType.NewLine || char.type === CharType.EOF) {
            // Comment ends at a newline.
            this.transitionTo(State.INITIAL);
            // Emit the comment, then reprocess the newline/EOF so it can be handled properly (usually ignored).
            return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.COMMENT };
        }
        // Otherwise, keep consuming characters as part of the comment.
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
    }

    // Handles '/*' comments
    private processMultiLineComment(char: Character): Action {
        if (char.type === CharType.Star) {
            // We might be at the end of the comment. Transition to check the next character.
            this.transitionTo(State.IN_MULTI_LINE_COMMENT_SAW_STAR);
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
        }
        // Keep consuming any other character.
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
    }

    // Handles when we've just seen a '*' inside a '/*' comment
    private processMultiLineCommentSawStar(char: Character): Action {
        if (char.type === CharType.Slash) {
            // This is the closing '*/'. The comment is finished.
            this.transitionTo(State.INITIAL);
            // Buffer this final '/', then emit the whole comment token.
            return { emit: true, reprocess: false, ignore: true, tokenType: TokenType.COMMENT };
        }
        if (char.type === CharType.Star) {
            // We saw another star, like in `/**`. Stay in this state.
            return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
        }

        // False alarm. The '*' was just part of the comment text. Go back to the general multi-line state.
        this.transitionTo(State.IN_MULTI_LINE_COMMENT);
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.COMMENT };
    }

    // Handles escaped characters inside of a string.
    private processEscape(char: Character): Action {
        // After processing an escaped character, we must return to the IN_STRING state,
        this.transitionTo(State.IN_STRING);
        return { emit: false, reprocess: false, ignore: false, tokenType: TokenType.STRING };
    }

    // Handles emitting single-character symbols.
    private processSymbol(char: Character): Action {
        // Any new character means the single symbol is complete.
        this.transitionTo(State.INITIAL);
        return { emit: true, reprocess: true, ignore: false, tokenType: TokenType.SYMBOL };
    }
}

export {
    Context
}





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Context.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Character/CharacterStream.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




import { CharType, type Position, type Character } from './utils/CharType.ts';
import { CharSpec } from './utils/CharSpec.ts';
import { CharClassify } from './utils/CharClassify.ts'
import { inspect, styleText, type InspectOptions } from 'node:util';
import { PrintLine, CenteredText, BoxText, Spacer } from '../Logging.ts';
import { BoxType } from '../types/Logging.types.ts';

/**
 * Provides a stateful, iterable stream of `Character` objects from a source string.
 * It supports Unicode, peeking, backtracking, and speculative parsing via marks.
 */
class CharacterStream implements Iterable<Character> {
    // The Unicode-normalized (NFC) source string being processed.
    private source: string = ''.normalize('NFC');
    // The current byte index of the cursor in the source string.
    private index: number = 0;
    // The current 1-based line number of the cursor.
    private line: number = 1;
    // The current 1-based column number of the cursor.
    private column: number = 1;
    private shouldLog: boolean = false;
    private isLoggingActive: boolean = false;
    private logMessage = 'CHARACTER STREAM DEMONSTRATION:';
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

    /**
     * A buffer of all previously processed `Character` objects. This serves as the
     * stream's history, enabling backtracking (`back()`) and lookbehind (`lookbackWhile()`).
     * Using the full `Character` object is a design choice to retain type and
     * position info, not just the raw value.
     */
    private charsBuffer: Character[] = [];

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
     * Sets the current source string of the stream.
     * @param {string} input The new source string.
     */
    public set(input: string) {
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
     * @param {number} indexOrPosition - The character index.
     * @param {number} line - The line number.
     * @param {number} column - The column number.
     *
     * or
     * 
     * Manually set to a specific position using a Position object.
     * @param {Position} indexOrPosition - The Position object to apply.
     */
    public setPosition(indexOrPosition: number | Position, line: number = 1, column: number = 1): void {
        if (typeof indexOrPosition === 'object') {
            this.index = indexOrPosition.index;
            this.line = indexOrPosition.line;
            this.column = indexOrPosition.column;
        } else {
            this.index = indexOrPosition;
            this.line = line;
            this.column = column;
        }
    }

    /**
     * Makes the stream class itself an iterable, allowing it to be used in `for...of` loops.
     * @returns {Iterator<Character>} The stream instance.
     */
    public [Symbol.iterator](): Iterator<Character> {
        this.isLoggingActive = false;
        return this;
    }

    /**
     * Consumes and returns the next character in the stream, advancing the cursor.
     * Part of the Iterator protocol.
     * @returns {IteratorResult<Character>} An object with `done` and `value` properties.
     */
    public next(): IteratorResult<Character> {
        if (this.shouldLog && !this.isLoggingActive) {
            this.logHeaderAndSource();
            this.isLoggingActive = true;
        }

        if (this.isEOF()) {
            if (this.isLoggingActive) {
                this.logFooter();
                this.isLoggingActive = false;
                this.shouldLog = false; // Reset for the next iteration
            }
            return { done: true, value: this.atEOF() };
        }

        const nextChar = this.peek();
        this.advance(nextChar.value);
        this.charsBuffer.push(nextChar);

        if (this.isLoggingActive) {
            this.logCharacter(nextChar);
        }

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
        if (this.isEOF(pos.index)) return this.atEOF(pos);

        const value = String.fromCodePoint(this.source.codePointAt(pos.index)!);

        return {
            value,
            type: CharClassify(value),
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

    public lookback(): Character {
        if (this.charsBuffer.length === 0) return null as unknown as Character;
        return this.charsBuffer[this.charsBuffer.length - 1]!;
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

    /**
     * Enables logging for the next full iteration of the stream.
     * @param {string} [message] - An optional message for the log header.
     */
    public withLogging(message?: string): this {
        this.shouldLog = true;
        if (message) this.logMessage = message;
        return this;
    }

    /**
     * Disables logging.
     */
    public withoutLogging(): this {
        this.shouldLog = false;
        return this;
    }

    private logHeaderAndSource(): void {
        if (!this.shouldLog) return;

        // Output Title Line
        PrintLine({ postNewLine: true, color: 'red', textColor: 'magenta', text: this.logMessage });

        // Output Source Title
        CenteredText(styleText('yellow', 'SOURCE:\n'));

        // Output Source String
        BoxText(this.get(), { width: 50, boxType: BoxType.double, textColor: 'yellow' });

        // Output Divider between Source and Result
        PrintLine({ preNewLine: true, postNewLine: true });

        // Output Result Title
        console.log(styleText('yellow', 'RESULT (CHARACTERS):'));
    }

    private logCharacter(char: Character): void {
        // In conjunction with next() output each character
        console.log(`${Spacer(3)}${inspect(char, this.inspectOptions)}`);
    }

    private logFooter(): void {
        // Output Ending Divider after all results
        PrintLine({ preNewLine: true, color: 'red' });
    }

} // End class CharacterStream

export {
    type Position,
    type Character,
    CharType,
    CharSpec,
    CharClassify,
    CharacterStream
}






//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Character/CharacterStream.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Character/utils/CharClassify.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




import { CharType } from './CharType';
import { CharSpec } from './CharSpec.ts';

export type CharClassifyFn = (char: string) => CharType;

/**
 * Classifies a character using a multi-step, stateless process.
 * The algorithm is:
 * 1. Handle stream control cases (EOF, null).
 * 2. Attempt a fast O(1) lookup in `CHARSYMBOL_MAP`.
 * 3. If not found, iterate through the ordered `CHARREGEX_MAP`.
 * 4. If no rule matches, return a fallback `CharType`.
 * @param char The character string to classify.
 * @returns The classified `CharType` of the character.
 */
export const CharClassify: CharClassifyFn = (char: string): CharType => {
    if (char === undefined || char === null) return CharType.Error;

    // Loop through the ordered classification rules (fallback).
    for (const [type, predicate] of CharSpec) {
        if (predicate(char)) return type;
    }

    // Fallback type
    return CharType.Other;
};





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Character/utils/CharClassify.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Character/utils/CharSpec.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




import { CharType } from './CharType';

export type CharSpecFn = (char: string) => boolean;
export type CharSpec = Map<CharType, CharSpecFn>;

/**
 * A map of common single characters to their specific types and
 * an ordered list of regular expression rules. The order is critical for
 * correct classification, testing for more specific categories (like Emoji)
 * before more general ones (like Symbol).
 */
export const CharSpec: CharSpec = new Map([
    [CharType.EOF, (char: string) => char === ''],
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

    /**
     * SPECIFIC ASCII AND
     * UNICODE SYMBOLS
     ** P	Punctuation (includes):
     *      Pc	Connector Punctuation
     *      Pd	Dash Punctuation
     *      Ps	Open Punctuation
     *      Pe	Close Punctuation
     *      Pi	Initial Punctuation
     *      Pf	Final Punctuation
     *      Po	Other Punctuation
     * 
     ** S	Symbol (includes):
     *      Sm	Math Symbol
     *      Sc	Currency Symbol
     *      Sk	Modifier Symbol
     *      So	Other Symbol
     */
    [CharType.Hash, (char: string) => char === '#'],
    [CharType.Percent, (char: string) => char === '%'],
    [CharType.Slash, (char: string) => char === '/'],
    [CharType.Comma, (char: string) => char === ','],
    [CharType.LParen, (char: string) => char === '('],
    [CharType.RParen, (char: string) => char === ')'],
    [CharType.Plus, (char: string) => char === '+'],
    [CharType.Minus, (char: string) => char === '-'],
    [CharType.Star, (char: string) => char === '*'],
    [CharType.Dot, (char: string) => char === '.'],
    [CharType.Backtick, (char: string) => char === '`'],
    [CharType.SingleQuote, (char: string) => char === "'"],
    [CharType.DoubleQuote, (char: string) => char === '"'],
    [CharType.BackSlash, (char: string) => char === '\\'],
    [CharType.Tilde, (char: string) => char === '~'],
    [CharType.Exclamation, (char: string) => char === '!'],
    [CharType.At, (char: string) => char === '@'],
    [CharType.Dollar, (char: string) => char === '$'],
    [CharType.Question, (char: string) => char === '?'],
    [CharType.Caret, (char: string) => char === '^'],
    [CharType.Ampersand, (char: string) => char === '&'],
    [CharType.LessThan, (char: string) => char === '<'],
    [CharType.GreaterThan, (char: string) => char === '>'],
    [CharType.Underscore, (char: string) => char === '_'],
    [CharType.EqualSign, (char: string) => char === '='],
    [CharType.LBracket, (char: string) => char === '['],
    [CharType.RBracket, (char: string) => char === ']'],
    [CharType.LBrace, (char: string) => char === '{'],
    [CharType.RBrace, (char: string) => char === '}'],
    [CharType.SemiColon, (char: string) => char === ';'],
    [CharType.Colon, (char: string) => char === ':'],
    [CharType.Pipe, (char: string) => char === '|'],
    [CharType.Punctuation, (char: string) => /\p{P}/u.test(char)],
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
]);






//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Character/utils/CharSpec.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/Character/utils/CharType.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




/**
 * Represents a specific location within the source string, tracked by index,
 * line number, and column number.
 */
export type Position = {
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
export type Character = {
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
export type CharValue =
    | 'EOF'
    | 'Error'
    | 'Other'
    | 'Whitespace'
    | 'NewLine'
    | 'Letter'
    | 'Number'
    | 'Hex'
    | 'SingleQuote'
    | 'DoubleQuote'
    | 'Backtick'
    | 'LParen'
    | 'RParen'
    | 'LBracket'
    | 'RBracket'
    | 'LBrace'
    | 'RBrace'
    | 'Plus'
    | 'Minus'
    | 'Star'
    | 'Slash'
    | 'BackSlash'
    | 'EqualSign'
    | 'Percent'
    | 'Caret'
    | 'Tilde'
    | 'Pipe'
    | 'LessThan'
    | 'GreaterThan'
    | 'Dot'
    | 'Comma'
    | 'Colon'
    | 'SemiColon'
    | 'Exclamation'
    | 'Question'
    | 'Punctuation'
    | 'Hash'
    | 'At'
    | 'Ampersand'
    | 'Dollar'
    | 'Underscore'
    | 'Currency'
    | 'Symbol'
    | 'Emoji'
    | 'Unicode';

// Σ (Sigma) - the set of allowed characters
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
};





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/Character/utils/CharType.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/types/Logging.types.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/types/PrintLine.types.ts

/** 
 * @type AlignType
 * @description Type defining text alignment options.
 */
export type AlignType = 'left' | 'center' | 'right';

/** 
 * @enum Align
 * @description Enum for different text alignments.
 */
export enum Align {
    left =   'left',
    center = 'center',
    right =  'right',
}

/** 
 * @type StyleType
 * @description Type defining available text styles.
 */
export type StyleType =
    | "bold" | "reset" | "dim" | "italic" | "underline" 
    | "blink" | "inverse" | "hidden" | "strikethrough" | "doubleunderline"
;

/** 
 * @enum Style
 * @description Enum for different text styles.
 */
export enum Style {
    bold =          'bold',
    reset =         'reset',
    dim =           'dim',
    italic =        'italic',
    underline =     'underline',
    blink =         'blink',
    inverse =       'inverse',
    hidden =        'hidden',
    strikethrough = 'strikethrough',
    doubleunderline = 'doubleunderline',
}

/** 
 * @type ColorType
 * @description Type defining available text colors.
 */
export type ColorType =
    | "green" | "red" | "yellow" | "cyan" | "black" | "blue" 
    | "magenta" | "white" | "gray" | "redBright" | "greenBright" | "yellowBright" 
    | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright"
; 

/** 
 * @enum Color
 * @description Enum for different text colors.
 */
export enum Color {
    green =         'green',
    red =           'red',
    yellow =        'yellow',
    cyan =          'cyan',
    black =         'black',
    blue =          'blue',
    magenta =       'magenta',
    white =         'white',
    gray =          'gray',
    redBright =     'redBright',
    greenBright =   'greenBright',
    yellowBright =  'yellowBright',
    blueBright =    'blueBright',
    magentaBright = 'magentaBright',
    cyanBright =    'cyanBright',
    whiteBright =   'whiteBright',
}

/** 
 * @type BackgroundColorType
 * @description Type defining available background colors.
 */
export type BackgroundColorType =
    | "bgGreen" | "bgRed" | "bgYellow" | "bgCyan" | "bgBlack" | "bgBlue" | "bgMagenta" 
    | "bgWhite" | "bgGray" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" 
    | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright"
;

/** 
 * @enum BackgroundColor
 * @description Enum for different background colors.
 */
export enum BackgroundColor {
    bgGreen =         'bgGreen',
    bgRed =           'bgRed',
    bgYellow =        'bgYellow',
    bgCyan =          'bgCyan',
    bgBlack =         'bgBlack',
    bgBlue =          'bgBlue',
    bgMagenta =       'bgMagenta',
    bgWhite =         'bgWhite',
    bgGray =          'bgGray',
    bgRedBright =     'bgRedBright',
    bgGreenBright =   'bgGreenBright',
    bgYellowBright =  'bgYellowBright',
    bgBlueBright =    'bgBlueBright',
    bgMagentaBright = 'bgMagentaBright',
    bgCyanBright =    'bgCyanBright',
    bgWhiteBright =   'bgWhiteBright',
}

/** 
 * @type InspectColor
 * @description Type defining available inspect colors.
 */
type InspectColor = StyleType | ColorType | BackgroundColorType; // From 'node:util'

/**
 * @enum LineType
 * @description Enum for different line types.
 */
export enum LineType {
    default =          '─',
    dashed =           '-',
    underscore =       '_',
    doubleUnderscore = '‗',
    equals =           '=',
    double =           '═',
    diaeresis =        '¨',
    macron =           '¯',
    section =          '§',
    interpunct =       '·',
    lightBlock =       '░',
    mediumBlock =      '▒',
    heavyBlock =       '▓',
    boldBlock =        '█',
    boldSquare =       '■',
    boldBottom =       '▄',
    boldTop =          '▀',
};

/**
 * @enum BoxStyle
 * @description Enum for different box styles.
 */
export enum BoxType {
    single,
    double,
    light,
    medium,
    heavy,
    bold,
    half,
    star,
    circle,
    square,
    hash
}

/**
 * @type BoxPartKeys
 * @description Type defining the keys for box parts.
 */
export enum BoxPart { tl = 'tl', t = 't', tr = 'tr', l = 'l', r = 'r', bl = 'bl', b = 'b', br = 'br' }

/**
 * @type BoxParts
 * @description Type defining the structure for box parts.
 */
export type BoxParts = Record<BoxPart, string>;

/**
 * @constant BoxStyles
 * @description Predefined box styles with their corresponding characters.
 */
export const BoxStyles = {
    [BoxType.single]: { tl: '┌', t: '─', tr: '┐', l: '│', r: '│', bl: '└', b: '─', br: '┘' },
    [BoxType.double]: { tl: '╔', t: '═', tr: '╗', l: '║', r: '║', bl: '╚', b: '═', br: '╝' },
    [BoxType.light]:  { tl: '░', t: '░', tr: '░', l: '░', r: '░', bl: '░', b: '░', br: '░' },
    [BoxType.medium]: { tl: '▒', t: '▒', tr: '▒', l: '▒', r: '▒', bl: '▒', b: '▒', br: '▒' },
    [BoxType.heavy]:  { tl: '▓', t: '▓', tr: '▓', l: '▓', r: '▓', bl: '▓', b: '▓', br: '▓' },
    [BoxType.bold]:   { tl: "█", t: "█", tr: "█", l: "█", r: "█", bl: "█", b: "█", br: "█" },
    [BoxType.half]:   { tl: '▄', t: '▄', tr: '▄', l: '█', r: '█', bl: '▀', b: '▀', br: '▀' },
    [BoxType.star]:   { tl: '*', t: '*', tr: '*', l: '*', r: '*', bl: '*', b: '*', br: '*' },
    [BoxType.circle]: { tl: '●', t: '●', tr: '●', l: '●', r: '●', bl: '●', b: '●', br: '●' },
    [BoxType.square]: { tl: '■', t: '■', tr: '■', l: '■', r: '■', bl: '■', b: '■', br: '■' },
    [BoxType.hash]:   { tl: '#', t: '#', tr: '#', l: '#', r: '#', bl: '#', b: '#', br: '#' },
} as const;

/** 
 * @interface Theme
 * @description Defines the structure for a theme object.
 * @property {InspectColor | InspectColor[]} color - The color(s) associated with the theme.
 * @property {LineType} line - The line type associated with the theme.
 * @property {(StyleType)[]} [styles] - Optional styles associated with the theme.
 */
export interface Theme {
    color: InspectColor | InspectColor[];
    line: LineType;
    styles?: (StyleType)[];
}

/**
 * @constant THEMES
 * @description Predefined themes for PrintLine.
 */
export const Themes: Record<string, Theme> = {
    Success: 
        { color: 'green',   line: LineType.default,     styles: ['bold']    },
    Error: 
        { color: 'red',     line: LineType.boldBlock                             },
    Warning: 
        { color: 'yellow',  line: LineType.dashed                           },
    Info: 
        { color: 'cyan',    line: LineType.default                          },
} as const;

/** 
 * @interface PrintLineOptions
 * @description Defines the structure for a PrintLine options object.
 * @property {number} width - The width of the line.
 * @property {boolean} preNewLine - If true, adds a newline before the line.
 * @property {boolean} postNewLine - If true, adds a newline after the line.
 * @property {LineType} lineType - The style of the line.
 * @property {AlignType} textAlign - The alignment of the text.
 * @property {keyof typeof THEMES} theme - Apply a predefined theme.
 * @property {InspectColor | InspectColor[]} color - The color of the line.
 * @property {InspectColor | InspectColor[]} bgColor - The background color of the line.
 * @property {StyleType | StyleType[]} styles - The styles applied to the line.
 * @property {string} text - The text to display on the line.
 */
export interface PrintLineOptions {
    // Alignment options
    width?: number;
    preNewLine?: boolean;
    postNewLine?: boolean;
    
    // Line options
    lineType?: LineType;
    theme?: keyof typeof Themes;
    color?: InspectColor | InspectColor[];
    bgColor?: InspectColor | InspectColor[];
    gradient?: [InspectColor, InspectColor];
    styles?: StyleType | StyleType[];

    // Text options
    text?: string;
    textAlign?: AlignType;
    textColor?: InspectColor | InspectColor[];
}

/** 
 * @type BoxWidth
 * @description Type defining box width options.
 * 'tight' - Width adjusts to fit the text content.
 * 'max'   - Width spans the maximum allowed width.
 * number  - Specific numeric width.
 */
type BoxWidth = 'tight' | 'max' | number;

export enum Width {
    default = 80,
    tight = 'tight',
    max =   'max',
}

/** 
 * @interface BoxTextOptions
 * @description Defines the structure for a BoxText options object.
 * @property {BoxWidth} width - The width of the box.
 * @property {boolean} preNewLine - If true, adds a newline before the box.
 * @property {boolean} postNewLine - If true, adds a newline after the box.
 * @property {BoxType} boxType - The style of the box.
 * @property {AlignType} boxAlign - The alignment of the box.
 * @property {keyof typeof THEMES} theme - Apply a predefined theme.
 * @property {InspectColor | InspectColor[]} color - The default foreground color of the box.
 * @property {InspectColor | InspectColor[]} bgColor - The default backgound color of the box.
 * @property {StyleType | StyleType[]} styles - The styles of the box.
 * @property {InspectColor | InspectColor[]} textColor - The text color inside the box.
 * @property {InspectColor | InspectColor[]} textBgColor - The text background color inside the box.
 */
export interface BoxTextOptions {
    // Alignment options
    width?: BoxWidth;
    preNewLine?: boolean;
    postNewLine?: boolean;

    // Box options
    boxType?: BoxType;
    boxAlign?: AlignType;
    theme?: keyof typeof Themes;
    color?: InspectColor | InspectColor[];
    bgColor?: InspectColor | InspectColor[];
    styles?: StyleType | StyleType[];

    // Text options
    textColor?: InspectColor | InspectColor[];
    textBgColor?: InspectColor | InspectColor[];
}






//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/types/Logging.types.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/types/Context.types.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/types/Context.types.ts

import { CharType } from '../Character/utils/CharType.ts';
import { TokenType } from './Tokenizer.types.ts';

export enum State {
    INITIAL = 'INITIAL',
    IN_IDENTIFIER = 'IN_IDENTIFIER',
    IN_STRING = 'IN_STRING',
    SEEN_SLASH = 'SEEN_SLASH',
    IN_SINGLE_LINE_COMMENT = 'IN_SINGLE_LINE_COMMENT',
    IN_MULTI_LINE_COMMENT = 'IN_MULTI_LINE_COMMENT',
    IN_MULTI_LINE_COMMENT_SAW_STAR = 'IN_MULTI_LINE_COMMENT_SAW_STAR',
    IN_HEXVALUE = 'IN_HEXVALUE',
    IN_NUMBER = 'IN_NUMBER',
    IN_PERCENT = 'IN_PERCENT',
    IN_DIMENSION = 'IN_DIMENSION',
    IN_EQUALS = 'IN_EQUALS',
    IN_PLUS = 'IN_PLUS',
    IN_MINUS = 'IN_MINUS',
    IN_STAR = 'IN_STAR',
    IN_DOT = 'IN_DOT',
    IN_COMMA = 'IN_COMMA',
    IN_SLASH = 'IN_SLASH',
    IN_LPAREN = 'IN_LPAREN',
    IN_RPAREN = 'IN_RPAREN',
    IN_ESCAPE = 'IN_ESCAPE',
    IN_SYMBOL = 'IN_SYMBOL',
    IN_NEWLINE = 'IN_NEWLINE',
    IN_WHITESPACE = 'IN_WHITESPACE',
    IN_EOF = 'IN_EOF',
    IN_OTHER = 'IN_OTHER',
    IN_ERROR = 'IN_ERROR',
    END = 'END',
}

// The instructions the Context gives back to the Tokenizer.
export interface Action {
    emit: boolean;          // Should the current buffer be emitted as a token?
    reprocess: boolean;     // Should the current character be re-processed in the new state?
    ignore: boolean;        // Should the current character be ignored and not buffered?
    charType?: CharType;    // What character type triggered this action?  
    tokenType: TokenType;   // What type of token should be emitted?
}

export type QuoteType = CharType.Backtick | CharType.SingleQuote | CharType.DoubleQuote;







//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/types/Context.types.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/types/Forgotten.types.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




type TokenKind = typeof TokenType[keyof typeof TokenType];
type CharKind = typeof CharType[keyof typeof CharType];
type CharClassifyFn = (char: string) => boolean;
type State = typeof State[keyof typeof State];
type StateType<T extends string> = { [K in T]: `<${Lowercase<K>}>`; }; // QType
type CharKindType = [CharKind, CharClassifyFn][] // SigmaType
type TransitionType = Record<State, Partial<Record<CharKind, State>>>; // DeltaType
type AcceptingType = Partial<Record<State, TokenKind>>; // Ftype

// Terminals used in accepting states
const TokenType = {
    // String and Numeric Literals
    IDENTIFIER: 'IDENTIFIER',  // words
    STRING: 'STRING',          // string literals
    HEXVALUE: 'HEXVALUE',      // hexadecimal values
    NUMBER: 'NUMBER',          // numeric literals
    PERCENT: 'PERCENT',        // numeric literals followed by '%'
    DIMENSION: 'DIMENSION',    // numeric literals followed by units
    UNICODE: 'UNICODE',        // unicode characters

    // Operator Tokens
    PLUS: 'PLUS',              // '+'
    MINUS: 'MINUS',            // '-'

    // Delimiter Tokens
    COMMA: 'COMMA',            // ','
    SLASH: 'SLASH',            // '/'
    LPAREN: 'LPAREN',          // '('
    RPAREN: 'RPAREN',          // ')'
    DELIMITER: 'DELIMITER',    // all other delimiters, puntuators
    OPERATOR: 'OPERATOR',

    // Possibly ignored Tokens
    WHITESPACE: 'WHITESPACE',  // all whitespace
    EOF: '<end>',              // end of file/line
    ERROR: '<error>',          // token error
} as const;

// Σ (Sigma) - the set of allowed characters
const CharType = {
    Whitespace: 'Whitespace',
    Quote: 'Quote',
    Letter: 'Letter',
    Digit: 'Digit',
    Exponent: 'Exponent',
    Percent: 'Percent',
    Dot: 'Dot',
    LParen: 'LParen',
    RParen: 'RParen',
    Comma: 'Comma',
    Slash: 'Slash',
    Plus: 'Plus',
    Minus: 'Minus',
    Hash: 'Hash',
    Hex: 'Hex',
    Unicode: 'Unicode',
    Operator: 'Operator',
    Other: 'Other',
    EOF: 'EOF',
} as const;

// Q - the set of all possible states
const State = {
    Start: '<start>',
    Whitespace: '<whitespace>',
    InsideQuote: '<inside-quote>',
    EndQuote: '<end-quote>',
    Identifier: '<identifier>',
    HexValue: '<hexvalue>',
    Integer: '<integer>',
    Float: '<float>',
    Exponent: '<exponent>',
    Delimiter: '<delimiter>',
    Operator: '<operator>',
    Error: '<error>',
    Percent: '<percent>',
    Dimension: '<dimension>',
    Unicode: '<unicode>',
} as const;

// δ (delta) - the set of rules for transitioning between states
const Transition: TransitionType = {
    [State.Start]: {
        [CharType.Quote]: State.InsideQuote,
        [CharType.Whitespace]: State.Whitespace,
        [CharType.Hash]: State.HexValue,
        [CharType.Letter]: State.Identifier,
        [CharType.Dot]: State.Delimiter,
        [CharType.Digit]: State.Integer,
        [CharType.Percent]: State.Percent,
        [CharType.Plus]: State.Operator,
        [CharType.Minus]: State.Operator,
        [CharType.LParen]: State.Delimiter,
        [CharType.RParen]: State.Delimiter,
        [CharType.Comma]: State.Delimiter,
        [CharType.Slash]: State.Delimiter,
        [CharType.Unicode]: State.Unicode,
        [CharType.Operator]: State.Operator,
        [CharType.Other]: State.Error,
    },

    [State.Whitespace]: {
        [CharType.Whitespace]: State.Whitespace,
    },

    [State.HexValue]: {
        [CharType.Hex]: State.HexValue,
        [CharType.Exponent]: State.HexValue,
        [CharType.Letter]: State.HexValue,
        [CharType.Digit]: State.HexValue,
    },

    [State.InsideQuote]: {
        [CharType.Whitespace]: State.InsideQuote,
        [CharType.Hash]: State.InsideQuote,
        [CharType.Exponent]: State.InsideQuote,
        [CharType.Letter]: State.InsideQuote,
        [CharType.Digit]: State.InsideQuote,
        [CharType.Percent]: State.InsideQuote,
        [CharType.Plus]: State.InsideQuote,
        [CharType.Minus]: State.InsideQuote,
        [CharType.LParen]: State.InsideQuote,
        [CharType.RParen]: State.InsideQuote,
        [CharType.Comma]: State.InsideQuote,
        [CharType.Slash]: State.InsideQuote,
        [CharType.Unicode]: State.InsideQuote,
        [CharType.Operator]: State.InsideQuote,
        [CharType.Quote]: State.EndQuote,
    },

    [State.EndQuote]: {
        [CharType.Hash]: State.InsideQuote,
        [CharType.Exponent]: State.InsideQuote,
        [CharType.Letter]: State.InsideQuote,
        [CharType.Digit]: State.InsideQuote,
        [CharType.Percent]: State.InsideQuote,
        [CharType.Plus]: State.InsideQuote,
        [CharType.Minus]: State.InsideQuote,
        [CharType.LParen]: State.InsideQuote,
        [CharType.RParen]: State.InsideQuote,
        [CharType.Comma]: State.InsideQuote,
        [CharType.Slash]: State.InsideQuote,
        [CharType.Unicode]: State.InsideQuote,
        [CharType.Operator]: State.InsideQuote,
        [CharType.Quote]: State.EndQuote,
    },

    [State.Identifier]: {
        [CharType.Exponent]: State.Identifier,
        [CharType.Letter]: State.Identifier,
        [CharType.Digit]: State.Identifier,
        [CharType.Minus]: State.Identifier,
    },

    [State.Integer]: {
        [CharType.Operator]: State.Integer,
        [CharType.Exponent]: State.Integer,
        [CharType.Dot]: State.Float,
        [CharType.Percent]: State.Percent,
        [CharType.Letter]: State.Dimension,
        [CharType.Digit]: State.Integer,
    },

    [State.Float]: {
        [CharType.Exponent]: State.Float,
        [CharType.Percent]: State.Percent,
        [CharType.Letter]: State.Dimension,
        [CharType.Digit]: State.Float,
    },

    [State.Exponent]: {
        [CharType.Letter]: State.Identifier,
        [CharType.Digit]: State.Exponent,
    },

    [State.Percent]: {
    },

    [State.Dimension]: {
        [CharType.Digit]: State.Exponent,
        [CharType.Letter]: State.Dimension,
    },

    [State.Unicode]: {
        [CharType.Unicode]: State.Unicode,
    },

    [State.Delimiter]: {
        [CharType.LParen]: State.Delimiter,
        [CharType.RParen]: State.Delimiter,
        [CharType.Comma]: State.Delimiter,
        [CharType.Slash]: State.Delimiter,
        [CharType.Dot]: State.Delimiter,
    },

    [State.Operator]: {
        [CharType.Plus]: State.Operator,
        [CharType.Minus]: State.Operator,
        [CharType.Operator]: State.Operator,
    },

    [State.Error]: {
        [CharType.Other]: State.Error,
    }
}
// End of // δ (delta)

// F - the set of accepting states
const Accepting: AcceptingType = {
    [State.Whitespace]: TokenType.WHITESPACE,
    [State.HexValue]: TokenType.HEXVALUE,
    [State.Unicode]: TokenType.UNICODE,
    [State.EndQuote]: TokenType.STRING,
    [State.Identifier]: TokenType.IDENTIFIER,
    [State.Exponent]: TokenType.NUMBER,
    [State.Integer]: TokenType.NUMBER,
    [State.Float]: TokenType.NUMBER,
    [State.Percent]: TokenType.PERCENT,
    [State.Dimension]: TokenType.DIMENSION,
    [State.Delimiter]: TokenType.DELIMITER,
    [State.Operator]: TokenType.OPERATOR,
    [State.Error]: TokenType.ERROR,
}
// End of F




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/types/Forgotten.types.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/types/Parser.types.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/types/Parser.types.ts

/**
 * Represents a specific location within the source string, tracked by index,
 * line number, and column number.
 */
type Position = {
    /** The zero-based index of the character in the overall string. */
    index: number;
    /** The one-based line number where the character appears. */
    line: number;
    /** The one-based column number of the character on its line. */
    column: number;
}

/**
 * Source code location metadata
 */
type SourcePosition = {
    /** Starting position */
    start: Position;
    /** Ending position */
    end: Position;
}

/**
 * Node Types
 */
enum NodeType {
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
    SeriesExpression = 'SeriesExpression',
    AssignmentExpression = 'AssignmentExpression',
}

type VariableDeclarationKind = 'const' | 'let' | 'var';
type DimensionKind = 'deg' | 'grad' | 'rad' | 'turn';
type ColorFunctionKind = 'rgb' | 'rgba' | 'hsl' | 'hsla' | 
    'hwb' | 'lab' | 'lch' | 'oklab' | 'oklch' | 'ictcp' | 
    'jzazbz' | 'jzczhz' | 'alpha' | 'color';

/**
 * Base interface for all AST nodes
 */
type BaseNode = {
    /** Type of the AST node */
    type: NodeType;
    /** Source location information */
    position: SourcePosition;
}

/**
 * Program root node - contains all statements
 */
interface Program extends BaseNode {
    type: NodeType.Program;
    body: Statement[];
}

/**
 * Base type for all statements
 */
type Statement = ExpressionStatement | VariableDeclaration;

/**
 * Expression wrapped as a statement
 */
interface ExpressionStatement extends BaseNode {
    type: NodeType.ExpressionStatement;
    expression: Expression;
}

/**
 * Variable declaration node
 * Example: const x = 5;
 */
interface VariableDeclaration extends BaseNode {
    type: NodeType.VariableDeclaration;
    /** The kind of declaration (e.g., const, let, var) */
    kind: VariableDeclarationKind;
    /** The identifier being x */
    identifier: { name: string, type: NodeType };
    /** The expression the variable is initialized to (optional) */
    initializer?: Expression;
}

/**
 * Assignment to an existing variable
 * Example: myVar = 100
 */
interface AssignmentExpression extends BaseNode {
    type: NodeType.AssignmentExpression;
    left: Identifier; // The variable being assigned to
    right: Expression; // The value being assigned
}

/**
 * Base type for all expressions
 */
type Expression =
    | Identifier
    | StringLiteral
    | NumericLiteral
    | HexLiteral
    | PercentLiteral
    | DimensionLiteral
    | BinaryExpression
    | UnaryExpression
    | CallExpression
    | GroupExpression
    | SeriesExpression
    | AssignmentExpression;

/**
 * Identifier node (variable names, function names)
 * Example: red, myVar
 */
interface Identifier extends BaseNode {
    type: NodeType.Identifier;
    name: string;
}

/**
 * String literal node
 * Example: "hello", 'world'
 */
interface StringLiteral extends BaseNode {
    type: NodeType.StringLiteral;
    value: string;
    raw: string;
}

/**
 * Numeric literal node
 * Example: 42, 3.14
 */
interface NumericLiteral extends BaseNode {
    type: NodeType.NumericLiteral;
    value: number;
    raw: string;
}

/**
 * Hexadecimal color literal
 * Example: #ff0000, #abc
 */
interface HexLiteral extends BaseNode {
    type: NodeType.HexLiteral;
    value: string;
    raw: string;
}

/**
 * Percentage literal
 * Example: 50%, 100%
 */
interface PercentLiteral extends BaseNode {
    type: NodeType.PercentLiteral;
    value: number;
    raw: string;
}

interface DimensionLiteral extends BaseNode {
    type: NodeType.DimensionLiteral;
    value: number;
    unit: string;
    raw: string;
}

/**
 * Binary operation (two operands and an operator)
 * Example: 1 + 2, a - b
 */
interface BinaryExpression extends BaseNode {
    type: NodeType.BinaryExpression;
    operator: '+' | '-' | '*' | '/' | '%';
    left: Expression;
    right: Expression;
}

/**
 * Unary operation (one operand and an operator)
 * Example: -5, +10
 */
interface UnaryExpression extends BaseNode {
    type: NodeType.UnaryExpression;
    operator: '+' | '-';
    argument: Expression;
}

/**
 * Function call expression
 * Example: rgb(255, 0, 0)
 */
interface CallExpression extends BaseNode {
    type: NodeType.CallExpression;
    callee: Identifier;
    arguments: Expression[];
}

/**
 * Grouped expression (parentheses)
 * Example: (1 + 2)
 */
interface GroupExpression extends BaseNode {
    type: NodeType.GroupExpression;
    expression: Expression;
}

interface SeriesExpression extends BaseNode {
    type: NodeType.SeriesExpression;
    expressions: Expression[];
}

// EXPORTS
export {
    // Enumeration
    NodeType,

    // Types
    type Statement,
    type Expression,
    type VariableDeclarationKind,
    type DimensionKind,
    type ColorFunctionKind,

    // Interfaces
    type BaseNode,
    type SourcePosition,
    type Program,
    type ExpressionStatement,
    type VariableDeclaration,
    type Identifier,
    type StringLiteral,
    type NumericLiteral,
    type HexLiteral,
    type PercentLiteral,
    type DimensionLiteral,
    type BinaryExpression,
    type UnaryExpression,
    type CallExpression,
    type GroupExpression,
    type SeriesExpression,
    type AssignmentExpression,
};





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/types/Parser.types.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: src/types/Tokenizer.types.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/types/Tokenizer.types.ts

import type { Position } from "../Character/CharacterStream";

export enum TokenType {
    // State Control Tokens
    START = 'START',
    OTHER = 'OTHER',
    ERROR = 'ERROR',
    END = 'END',

    // Whitespace and Formatting Tokens
    WHITESPACE = 'WHITESPACE',
    NEWLINE = 'NEWLINE',

    // Primary Tokens
    IDENTIFIER = 'IDENTIFIER',
    NUMBER = 'NUMBER',
    HEXVALUE = 'HEXVALUE',
    SYMBOL = 'SYMBOL',

    // Context Specific Identifier Literals
    KEYWORD = 'KEYWORD',
    FUNCTION = 'FUNCTION',

    // Context Specific Numeric Literals
    PERCENT = 'PERCENT',
    DIMENSION = 'DIMENSION',

    // Context Specific String Literals
    STRING = 'STRING',
    ESCAPE = 'ESCAPE',
    COMMENT = 'COMMENT',

    // Context Specific Symbol Literals
    EQUALS = 'EQUALS',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    STAR = 'STAR',
    DOT = 'DOT',

    // Context Specific Delimiter Tokens
    COMMA = 'COMMA',
    SLASH = 'SLASH',
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    SEMICOLON = 'SEMICOLON'
}

export interface Token {
    value: string;
    type: TokenType;
    position: {
        start: Position;
        end: Position;
    }
}

export type CreateTokenFn = (value: string, type: TokenType, start: Position, end: Position) => Token;





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: src/types/Tokenizer.types.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████
