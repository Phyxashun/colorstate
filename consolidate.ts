// ./consolidate.ts

import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';

const tsOutputFile = 'ALL_FILES.ts';
const tsPatterns = [
    '*.ts',         // files in the root directory
    'src/**/*.ts',  // files in the src directory and subdirectories
];

const testOutputFile = 'ALL_TESTS.ts';
const testPatterns = [
    'tests/**/*.test.ts' // test files in the tests directory and subdirectories
];

const processFiles = (outputFile: string, patterns: string[]) => {
// Ensure the output file is empty before starting
if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
}

console.log(`Consolidating files into ${outputFile}...`);

patterns.forEach(pattern => {
    const files = globSync(pattern, { ignore: ['node_modules/**', outputFile] });

    files.forEach(file => {
        console.log(`Appending: ${file}`);
        const content = fs.readFileSync(file, 'utf-8');
        
        // Add a newline and a comment header to separate files in the output
        fs.appendFileSync(outputFile, `// @ts-nocheck\n`, 'utf-8');
        fs.appendFileSync(outputFile, `\n// ==================== Start of file: ${file} ====================\n`, 'utf-8');
        fs.appendFileSync(outputFile, content, 'utf-8');
        fs.appendFileSync(outputFile, `\n// ==================== End of file: ${file} ====================\n\n\n\n\n`, 'utf-8');
    });
});

console.log('Consolidation complete!!!');
}

processFiles(tsOutputFile, tsPatterns);
processFiles(testOutputFile, testPatterns);
