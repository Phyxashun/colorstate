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
    patterns: string [];
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
        jobName: 'Typescript',
        name: 'Main Project Typescript Files', 
        patterns: [
            'src/**/*.ts', 
            'index.ts',
            'Consolidate.ts',
        ] 
    },
    { 
        jobName: 'Configuration',
        name: 'Configuration Files and Markdown', 
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
        jobName: 'Test',
        name: 'New Test Files', 
        patterns: [
            'test/**/*.test.ts', 
        ] 
    },
    { 
        jobName: 'Test',
        name: 'Old Test Files', 
        patterns: [
            'test_old/**/*.ts',
            'test_old/**/*.test.ts',
        ], 
    }, //
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
     * @description Default options object for the printLine function.
     */
    defaultPrintLineOptions: {
        preNewLine: false,  // No preceding new line
        postNewLine: false, // No successive new line
        width: MAX_WIDTH,   // Use global const MAX_WIDTH = 80
        char: LINE_CHAR,    // Use global const LINE_CHAR = '='          
    },

    /**
     * @function printLine
     * @description Prints a styled horizontal line to the console.
     * @param {PrintLineOptions} [options={}] - Configuration options for the line.
     * @returns {void}
     */
    printLine: (options: PrintLineOptions = {}): void => {
        const { preNewLine, postNewLine, width, char } = {
            ...ui.defaultPrintLineOptions,
            ...options
        };
        const pre = preNewLine ? '\n' : '';
        const post = postNewLine ? '\n' : '';
        const styledDivider = styleText(['gray', 'bold'], char!.repeat(width!));
        console.log(`${pre}${styledDivider}${post}`);
    },

    /**
     * @function spacer
     * @description Creates a string of repeated characters, useful for padding.
     * @param {number} [width=TAB_WIDTH] - Number of characters to repeat.
     * @param {string} [char=SPACE] - The character to repeat.
     * @returns {string} A string of repeated characters.
     */
    spacer: (width: number = TAB_WIDTH, char: string = SPACE): string => char.repeat(width),

    /**
     * @function centerText
     * @description Centers a line of text within a given width by adding padding.
     * @param {string} text - The text to center.
     * @param {number} [width=MAX_WIDTH] - The total width to center within.
     * @returns {string} The centered text string.
     * @requires spacer - Function that return a string for spacing.
     */
    centerText: (text: string, width: number = MAX_WIDTH): string => {
        // Remove any existing styling for accurate length calculation
        const unstyledText = text.replace(/\x1b\[[0-9;]*m/g, '');
        const padding = Math.max(0, Math.floor((width - unstyledText.length) / 2));
        return `${ui.spacer(padding)}${text}`;
    },

    /**
     * @function centeredFiglet
     * @description Generates and centers multi-line FIGlet (ASCII) text.
     * @param {string} text - The text to convert to ASCII art.
     * @param {number} [width=MAX_WIDTH] - The total width to center the art within.
     * @returns {string} The centered, multi-line ASCII art as a single string.
     * @requires centerText
     */
    centeredFiglet: (text: string, width: number = MAX_WIDTH): string => {
        const rawFiglet = figlet.textSync(text, {
            font: FIGLET_FONT,
            width: width,
            whitespaceBreak: true
        });

        return rawFiglet.split('\n')
            .map(line => ui.centerText(line, width))
            .join('\n');
    },

    /**
     * @function displayHeader
     * @description Renders the main application header, including title and subtitle.
     * @returns {void}
     * @requires printLine
     * @requires centeredFiglet
     * @requires styleText
     * @requires centerText
     */
    displayHeader: async (): Promise<void> => {
        ui.printLine({ preNewLine: true });
        console.log(styleText(['yellowBright', 'bold'], ui.centeredFiglet(`Consolidate!!!`)));
        console.log(ui.centerText(styleText(['magentaBright', 'bold'], '*** PROJECT FILE CONSOLIDATOR SCRIPT ***')));
        ui.printLine({ preNewLine: true, postNewLine: true });
    },

    /**
     * Logs the start of a new consolidation job.
     * @param {string} jobName - The name of the job being processed.
     * @param {string} outputFile - The path of the output file for the job.
     */
    logJobStart: (jobName: string, outputFile: string): void => {
        const styledJob = styleText('cyan', `Consolidating all project ${jobName} files into`)
        console.log(styledJob, `${outputFile}...\n`);
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
        console.log(styleText(['green', 'bold'], '\nConsolidation complete!!!'));
        ui.printLine({ preNewLine: true, postNewLine: true });
    },
}

/**************************************************************************************************
 * 
 * FILE SYSTEM INTERACTION
 * 
 *************************************************************************************************/

const fileSystem = {
    /**
     * Ensures an output file is empty by deleting it if it already exists.
     * @param {string} filePath - The path to the output file to prepare.
     */
    prepareOutputFile: (filePath: string): void => {
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
        const space = ui.spacer(START_END_SPACER, '■');
        const endLine = ui.spacer(START_END_NEWLINE, '\n')
        
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
        const divider = ui.spacer(100, '█');
        const fileDivider = `//${divider}\n`;
        fs.appendFileSync(outputFile, fileDivider, UTF_8);
        fs.appendFileSync(outputFile, fileDivider, UTF_8);
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
    process: (job: ConsolidationJob): void => {
        const { name, outputFile, patterns } = job;

        ui.logJobStart(name, outputFile);
        fileSystem.prepareOutputFile(outputFile);

        fileSystem.findFiles(patterns, outputFile)
            .forEach(sourceFile => {
                ui.logFileAppend(sourceFile);
                fileSystem.appendFileWithHeaders(outputFile, sourceFile);
            });

        ui.logComplete();
    },

    /**
     * Runs all consolidation jobs defined in the configuration.
     * @param {config.ConsolidationJob[]} jobs - An array of consolidation jobs to execute.
     */
    run: (jobs: ConsolidationJob[]): void => {
        jobs.forEach(consolidateJobs.process);
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