// vitest.config.ts

import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
    test: {
        reporters: ['default', 'html'],
        coverage: {
            provider: 'istanbul',
            enabled: true,
            clean: true,
            reportsDirectory: './coverage',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                '**/utils/**/*',
                'test_old/**/*',
                '0.NOTES/**/*',
                'ALL/**/*'
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