import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as util from 'node:util';

import PrintLine, {
    Spacer,
    CenterText,
    CenteredFiglet,
    BoxText,
    LineType
} from '../src/PrintLine.ts';

// Mock styleText to return a predictable prefix so we can verify it was called
vi.mock('node:util', async (importOriginal) => {
    const actual = await importOriginal<typeof util>();
    return {
        ...actual,
        styleText: vi.fn((style, text) => `__STYLED__${text}__`),
    };
});

// Updated to strip both real ANSI and our mock tags
const stripAnsi = (str: string) =>
    str.replace(/\x1b\[[0-9;]*m/g, '')
        .replace(/__STYLED__/g, '')
        .replace(/__/g, ''); // Handles the suffix of the mock

describe('PrintLine Utility', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    beforeEach(() => {
        consoleSpy.mockClear();
    });

    describe('Spacer', () => {
        it('should repeat characters correctly', () => {
            expect(Spacer(5, '.')).toBe('.....');
            expect(Spacer(3)).toBe('   '); // Default space
        });
    });

    describe('CenterText', () => {
        it('should center text within the default width (80)', () => {
            const result = CenterText('Hello');
            const unstyled = stripAnsi(result);
            expect(unstyled.length).toBeGreaterThan(5);
            expect(unstyled.endsWith('Hello')).toBe(true);
            // 80 width, 5 chars = 37 spaces padding
            expect(unstyled).toBe(' '.repeat(37) + 'Hello');
        });
    });

    describe('CenteredFiglet', () => {
        it('should return a multi-line string', () => {
            const result = CenteredFiglet('Hi');
            expect(result.split('\n').length).toBeGreaterThan(1);
        });
    });

    describe('PrintLine', () => {
        it('should print a double line by default', () => {
            PrintLine();
            const output = stripAnsi(consoleSpy.mock.calls[0][0]);
            expect(output).toBe('═'.repeat(80));
        });

        it('should handle text alignment (left)', () => {
            PrintLine({ text: 'Test', textAlign: 'left', width: 20 });
            const output = stripAnsi(consoleSpy.mock.calls[0][0]);
            // " Test " is 6 chars. 20 - 6 = 14 line chars.
            expect(output).toBe(' Test ' + '═'.repeat(14));
        });

        it('should apply themes', () => {
            PrintLine({ theme: 'error', width: 10 });
            const output = stripAnsi(consoleSpy.mock.calls[0][0]);
            expect(output).toBe('█'.repeat(10));
        });

        it('should support gradients', () => {
            PrintLine({ gradient: ['red', 'blue'], width: 10 });
            // Gradient logic prints the same line but split by styleText
            const output = stripAnsi(consoleSpy.mock.calls[0][0]);
            expect(output).toBe('═'.repeat(10));
        });
    });

    describe('BoxText', () => {
        it('should throw error if custom width is too small', () => {
            expect(() => BoxText('Hi', { width: 3 })).toThrow();
        });

        it('should wrap text when width is specified', () => {
            const longText = "This is a very long string that should wrap";
            BoxText(longText, { width: 20 });
            const output = consoleSpy.mock.calls[0][0];
            const lines = output.split('\n');
            // Check that it created multiple content lines
            expect(lines.length).toBeGreaterThan(3);
        });

        it('should align the entire box to the right', () => {
            const text = "Hi";
            const boxWidth = 6; // "Hi" + 2 spaces + 2 borders
            BoxText(text, { width: 6, boxAlign: 'right' });

            const rawOutput = consoleSpy.mock.calls[0][0];
            const lines = rawOutput.split('\n');
            const firstLine = stripAnsi(lines[0]);

            // MAX_WIDTH(80) - boxWidth(6) = 74 spaces of padding
            expect(firstLine.startsWith(' '.repeat(74))).toBe(true);
        });

        it('should apply tight width by default', () => {
            BoxText("ABC");
            const output = stripAnsi(consoleSpy.mock.calls[0][0]);
            const lines = output.split('\n');
            // Top border: ┌ + ─ (3+2) + ┐ = 7 chars
            expect(lines[0].trim().length).toBe(7);
        });

        it('should handle pre and post newlines', () => {
            BoxText("Test", { preNewLine: true, postNewLine: true });
            const output = consoleSpy.mock.calls[0][0];
            expect(output.startsWith('\n')).toBe(true);
            expect(output.endsWith('\n')).toBe(true);
        });
    });

    describe('PrintLine Additional Alignments', () => {
        it('should handle text alignment (right)', () => {
            PrintLine({ text: 'Right', textAlign: 'right', width: 20 });
            const output = stripAnsi(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]);
            // " Right " is 7 chars. 20 - 7 = 13 line chars.
            expect(output).toBe('═'.repeat(13) + ' Right ');
        });

        it('should handle text alignment (center)', () => {
            PrintLine({ text: 'Mid', textAlign: 'center', width: 20 });
            const output = stripAnsi(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]);
            // " Mid " is 5 chars. 20 - 5 = 15. Left gets 7, right gets 8.
            expect(output).toBe('═'.repeat(7) + ' Mid ' + '═'.repeat(8));
        });

        it('should print only text if width is too small', () => {
            // Line 196: if (lineCharCount < 0)
            PrintLine({ text: 'This text is way too long for width', width: 10 });
            const output = stripAnsi(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]);
            expect(output).toContain('This text is way too long for width');
        });
    });

    describe('BoxText Extended Coverage', () => {
        it('should support width: "max"', () => {
            BoxText("Max Width Test", { width: 'max' });
            const rawOutput = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0];

            // Pass rawOutput through the GLOBAL stripAnsi first!
            const output = stripAnsi(rawOutput);

            const lines = output.split('\n');
            // Now this will be exactly 80
            expect(lines[0].length).toBe(80);
        });

        it('should center the box itself on the screen', () => {
            const text = "Hi"; // width 2
            // Box width: 1 (left) + 1 (space) + 2 (text) + 1 (space) + 1 (right) = 6
            // (80 - 6) / 2 = 37 spaces of padding
            BoxText(text, { width: 6, boxAlign: 'center' });
            const output = stripAnsi(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]);
            const lines = output.split('\n');
            expect(lines[0].startsWith(' '.repeat(37))).toBe(true);
        });

        it('should handle word wrapping correctly', () => {
            // Force words to wrap by providing a narrow width
            // "WrappingTest" (12 chars) + borders/padding (4) = 16. 
            // Setting width to 10 forces the word-wrap logic to trigger
            BoxText("Wrap Test Logic", { width: 10 });
            const output = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0];
            const lines = stripAnsi(output).split('\n');

            // It should create at least 3 content lines: "Wrap", "Test", "Logic"
            // Total lines including borders: 5
            expect(lines.length).toBeGreaterThanOrEqual(5);
        });

        it('should apply custom text styling by calling styleText', () => {
            BoxText("Styled", { textBgColor: 'bgRed', textColor: 'white' });

            const rawOutput = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0];

            // Check if our mock prefix exists in the output
            expect(rawOutput).toContain('__STYLED__');
            expect(rawOutput).toContain('Styled');
        });
    });

    describe('BoxText Array Support', () => {
        it('should accept an array of strings as input', () => {
            const lines = ['Line 1', 'Line 2', 'Line 3'];
            BoxText(lines);

            const rawOutput = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0];
            const output = stripAnsi(rawOutput);

            // Verify all lines are present
            expect(output).toContain('Line 1');
            expect(output).toContain('Line 2');
            expect(output).toContain('Line 3');

            // Verify the box is multi-line (Top + 3 content + Bottom = 5 lines)
            expect(output.split('\n').length).toBe(5);
        });

        it('should respect custom width when passing an array', () => {
            const lines = ['Short', 'A slightly longer line'];
            // Add boxAlign: 'left' to prevent centering padding from affecting the length check
            BoxText(lines, { width: 40, boxAlign: 'left' });

            const rawOutput = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0];
            const output = stripAnsi(rawOutput).split('\n');

            // Now it should be exactly 40
            expect(output[0].length).toBe(40);
        });

        it('should use the longest line length when width is "tight"', () => {
            // This specifically triggers the 'else' branch for non-wrapping strings
            const multiLineString = "Short\nThis is the longest line\nMedium";
            BoxText(multiLineString, { width: 'tight' });

            const rawOutput = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0];
            const output = stripAnsi(rawOutput).split('\n');

            // "This is the longest line" is 24 chars.
            // Box = 1 (border) + 1 (space) + 24 + 1 (space) + 1 (border) = 28.
            expect(output[0].trim().length).toBe(28);
        });
    });
});