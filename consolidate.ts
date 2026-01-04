// ./consolidate.ts

import figlet from 'figlet';
import standard from "figlet/fonts/Standard";
import * as fs from 'node:fs';
import { styleText, promisify, InspectColor } from 'node:util';
import { globSync } from 'glob';

const line = (width: number = 80): void => {
    console.log(styleText(['black', 'bold', 'bgGray'], '='.repeat(width)));
};

console.log();
line();
figlet.parseFont('Standard', standard);

const asciiArt = await figlet.text('    Consolidator!     ', {
    font: 'Standard',
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80,
    whitespaceBreak: true
});

const coloredArt = styleText(['black', 'bold', 'bgGray'], asciiArt!);
console.log(coloredArt);

const processFiles = (what: string, outputFile: string, patterns: string[]) => {
    // Ensure the output file is empty before starting
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);

    console.log(styleText('cyan', `Consolidating all project ${what} files into`), `${outputFile}...\n`);

    patterns.forEach(pattern => {
        const files = globSync(pattern, { ignore: ['node_modules/**', outputFile] });

        files.forEach(file => {
            console.log(styleText('blue', `\tAppending:`), `${file}`);
            const content = fs.readFileSync(file, 'utf-8');

            // Add a newline and a comment header to separate files in the output
            fs.appendFileSync(outputFile, `// @ts-nocheck\n\n`, 'utf-8');
            fs.appendFileSync(outputFile, `\n// ==================== Start of file: ${file} ====================\n\n`, 'utf-8');
            fs.appendFileSync(outputFile, content, 'utf-8');
            fs.appendFileSync(outputFile, `\n// ==================== End of file: ${file} ====================\n\n\n\n\n\n`, 'utf-8');
        });
    });

    console.log(styleText(['green', 'bold'], '\nConsolidation complete!!!\n'));
    line();
    console.log();
};

const consolidate = () => {
    line();
    console.log(styleText(['magentaBright', 'bold'], '\n*** PROJECT FILE CONSOLIDATOR SCRIPT ***\n'));
    line();
    console.log();
    
    /**
     * Configuration Files
     */
    const configWhat = styleText(['red', 'underline'], 'Configuration');
    const configOutputFile = './ALL/ALL_CONFIGS.ts';
    // config files in the root directory
    const configPatterns = [
        '.vscode/launch.json',
        '.vscode/settings.json',
        '.gitignore',
        '*.json',
        '*.config.ts',
        'License',
        'README.md',
    ];

    processFiles(configWhat, configOutputFile, configPatterns);

    /**
     * Typescript Files
     */
    const tsWhat = styleText(['red', 'underline'], 'Typescript');
    const tsOutputFile = './ALL/ALL_FILES.ts';
    // files in the root directory and
    // files in the src directory and subdirectories
    const tsPatterns = [
        'index.ts',
        'src/**/*.ts',
    ];

    processFiles(tsWhat, tsOutputFile, tsPatterns);

    /**
     * Test Files
     */
    const testWhat = styleText(['red', 'underline'], 'Test');
    const testOutputFile = './ALL/ALL_TESTS.ts';
    // test files in the tests directory and subdirectories
    const testPatterns = [
        'tests/**/*.test.ts'
    ];

    processFiles(testWhat, testOutputFile, testPatterns);
}

consolidate();