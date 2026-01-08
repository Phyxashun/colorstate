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
 * Constants
 */
const TEXT_OUTPUT_DIR = './ALL/txt/';
const TS_OUTPUT_DIR = './ALL/ts/';
const MAX_WIDTH: number = 80;
const LINE_CHAR = '█';
const TAB_WIDTH = 4;
const SPACE = ' ';
const START_END_SPACER = 30;
const START_END_NEWLINE = 2;
const UTF_8 = 'utf-8';
const FIGLET_FONT = 'Standard';
figlet.parseFont(FIGLET_FONT, standard);

const SOURCE_DEFINITIONS = [
    { 
        name: 'Typescript', 
        patterns: [
            'src/**/*.ts', 
            'index.ts',
            'Consolidate.ts',
        ] 
    },
    { 
        name: 'Configuration', 
        patterns: [
            '.vscode/launch.json', 
            '0. NOTES/*.md', 
            '.gitignore', 
            '*.json', 
            '*.config.ts', 
            'License', 
            'README.md'
        ] 
    },
    { 
        name: 'Test', 
        patterns: [
            'test/**/*.test.ts', 
        ] 
    },
    { 
        name: 'Old Test', 
        patterns: [
            'test_old/**/*.ts',
            'test_old/**/*.test.ts',
        ], 
        jobName: 'Test' 
    }, //
];

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
 * @description Generates an array of all consolidation jobs to be executed by the script.
 * @returns {ConsolidationJob[]}
 */
const generateJobsForType = (outputDir: string, extension: string): ConsolidationJob[] => {
    return SOURCE_DEFINITIONS.map((definition, index) => ({
        name: styleText(['red', 'underline'], definition.jobName ?? definition.name),
        outputFile: `${outputDir}${index + 1}_ALL_${definition.name.toUpperCase().replace(' ', '_')}.${extension}`,
        patterns: definition.patterns,
    }));
};

/**
 * @description An array of all consolidation jobs to be executed by the script.
 * @type {ConsolidationJob[]}
 */
const JOBS: ConsolidationJob[] = [
    ...generateJobsForType(TS_OUTPUT_DIR, 'ts'),
    ...generateJobsForType(TEXT_OUTPUT_DIR, 'txt'),
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


// Executes and exports the script.
export const Consolidate = main;

Consolidate();