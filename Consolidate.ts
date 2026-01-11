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