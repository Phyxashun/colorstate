// vitest.config.ts

//import {inspect, type InspectOptions } from 'node:util';

import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
    test: {
        reporters: ['default', 'html'],
        coverage: {
            provider: 'v8',
            enabled: true,
            clean: true,
            reportsDirectory: './coverage',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [ 
                '**/utils/**/*'
            ]
        },
        exclude: [
            ...configDefaults.exclude,
            '**/utils/**/*',
            'test_old/**/*',
            '.vscode/**/*',
            '0.NOTES/**/*',
            'ALL/**/*'
        ]
    }
});

// const inspectOptions: InspectOptions = {
//     showHidden: true,
//     depth: null,
//     colors: true,
//     customInspect: false,
//     showProxy: false,
//     maxArrayLength: null,
//     maxStringLength: null,
//     breakLength: 100,
//     compact: true,
//     sorted: false,
//     getters: false,
//     numericSeparator: true,
// };

// console.log('VITEST CONFIG DEFAULTS:\n');
// console.log(inspect(configDefaults, inspectOptions));
