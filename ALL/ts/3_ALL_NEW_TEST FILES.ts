

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test/Parser.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




import { describe, it, expect } from 'vitest';
import { Tokenizer } from '../src/Tokenizer';
import { Parser } from '../src/Parser';
import { NodeType } from '../src/AST';

describe('Parser', () => {
    it('parses arithmetic expressions', () => {
        const tokens = new Tokenizer().tokenize('1 + 2 * 3');
        const ast = new Parser(tokens).parse();

        expect(ast.type).toBe(NodeType.Program);
        expect(ast.body[0].expression.type).toBe(NodeType.BinaryExpression);
    });

    it('parses function calls', () => {
        const tokens = new Tokenizer().tokenize('rgb(1, 2, 3)');
        const ast = new Parser(tokens).parse();

        expect(ast.body[0].expression.type).toBe(NodeType.CallExpression);
    });

    it('parses grouped expressions', () => {
        const tokens = new Tokenizer().tokenize('(1 + 2)');
        const ast = new Parser(tokens).parse();

        expect(ast.body[0].expression.type).toBe(NodeType.GroupExpression);
    });

    it('throws on invalid binary expression', () => {
        const tokens = new Tokenizer().tokenize('1 +');
        
        expect(() => new Parser(tokens).parse()).toThrow();
    });
});





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test/Parser.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test/Context.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// test/Context.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { Context } from '../src/Context.ts';
import { CharType, type Character } from '../src/Character.ts';
import { State, TokenType } from '../src/types/Types.ts';

describe('Context State Machine', () => {
    let ctx: Context;

    // Helper to create a mock Character
    const char = (value: string, type: CharType): Character => ({
        value,
        type,
        position: { index: 0, line: 1, column: 1 }
    });

    beforeEach(() => {
        ctx = new Context();
    });

    describe('Initial Transitions', () => {
        it('should transition from INITIAL to IN_IDENTIFIER on a letter', () => {
            const action = ctx.process(char('a', CharType.Letter));
            expect(ctx.state).toBe(State.IN_IDENTIFIER);
            expect(action.emit).toBe(false);
        });

        it('should transition to IN_STRING and store quoteType', () => {
            const action = ctx.process(char('"', CharType.DoubleQuote));
            expect(ctx.state).toBe(State.IN_STRING);
            expect(action.ignore).toBe(true); // Quotes are usually ignored in the buffer
        });
    });

    describe('Numeric Logic (Dimensions & Percentages)', () => {
        it('should handle dimensions: Number -> Letter', () => {
            ctx.process(char('1', CharType.Number));
            expect(ctx.state).toBe(State.IN_NUMBER);

            const action = ctx.process(char('d', CharType.Letter));
            expect(ctx.state).toBe(State.IN_DIMENSION);
            expect(action.emit).toBe(false); // Still building the dimension
        });

        it('should handle percentages: Number -> Percent', () => {
            ctx.process(char('5', CharType.Number));
            const action = ctx.process(char('%', CharType.Percent));
            expect(ctx.state).toBe(State.IN_PERCENT);
            expect(action.tokenType).toBe(TokenType.PERCENT);
        });
    });

    describe('Comment Logic', () => {
        it('should identify a single-line comment after seen slash', () => {
            ctx.process(char('/', CharType.Slash)); // SEEN_SLASH
            const action = ctx.process(char('/', CharType.Slash));
            expect(ctx.state).toBe(State.IN_SINGLE_LINE_COMMENT);
            expect(action.tokenType).toBe(TokenType.COMMENT);
        });

        it('should handle a slash followed by a space as a division operator', () => {
            ctx.process(char('/', CharType.Slash)); // SEEN_SLASH
            const action = ctx.process(char(' ', CharType.Whitespace));
            expect(ctx.state).toBe(State.INITIAL);
            expect(action.reprocess).toBe(true);
            expect(action.tokenType).toBe(TokenType.SLASH);
        });

        it('should correctly exit a multi-line comment', () => {
            ctx.state = State.IN_MULTI_LINE_COMMENT;
            ctx.process(char('*', CharType.Star));
            expect(ctx.state).toBe(State.IN_MULTI_LINE_COMMENT_SAW_STAR);

            const action = ctx.process(char('/', CharType.Slash));
            expect(ctx.state).toBe(State.INITIAL);
            expect(action.emit).toBe(true);
        });
    });

    describe('String Escaping', () => {
        it('should transition to IN_ESCAPE when seeing a backslash in a string', () => {
            ctx.state = State.IN_STRING;
            ctx.process(char('\\', CharType.BackSlash));
            expect(ctx.state).toBe(State.IN_ESCAPE);
        });

        it('should return to IN_STRING after processing an escaped character', () => {
            ctx.state = State.IN_ESCAPE;
            const action = ctx.process(char('n', CharType.Letter));
            expect(ctx.state).toBe(State.IN_STRING);
            expect(action.emit).toBe(false);
        });
    });

    describe('Edge Cases & Branch Coverage', () => {
        it('should reset to INITIAL and reprocess on unknown states', () => {
            // Force an invalid state manually
            (ctx as any)._state = "INVALID_STATE";
            const action = ctx.process(char('?', CharType.Other));
            expect(ctx.state).toBe(State.INITIAL);
            expect(action.reprocess).toBe(true);
        });

        it('should handle the EOF transition from a comment', () => {
            ctx.state = State.IN_SINGLE_LINE_COMMENT;
            const action = ctx.process(char('', CharType.EOF));
            expect(ctx.state).toBe(State.INITIAL);
            expect(action.emit).toBe(true);
        });
    });
});





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test/Context.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test/PrintLine.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




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





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test/PrintLine.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test/Character.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/tests/Character.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { type Position, type Character, CharType, CharacterStream, CharClassify } from '../src/Character/CharacterStream.ts';


// Tests for Char.CharUtility (from your test run)
describe('Char.CharUtility', () => {
    describe('classify', () => {
        it('should classify stream-specific types', () => {
            expect(CharClassify('')).toBe(CharType.EOF);
            expect(CharClassify(null as any)).toBe(CharType.Error);
        });

        it('should classify specific named types from the SymbolMap', () => {
            expect(CharClassify('(')).toBe(CharType.LParen);
            expect(CharClassify('#')).toBe(CharType.Hash);
            expect(CharClassify('$')).toBe(CharType.Dollar);
        });

        it('should classify general categories for characters not in the SymbolMap', () => {
            expect(CharClassify('a')).toBe(CharType.Letter);
            expect(CharClassify('1')).toBe(CharType.Number);
            expect(CharClassify(' ')).toBe(CharType.Whitespace);
            expect(CharClassify('\n')).toBe(CharType.NewLine);
            expect(CharClassify('¡')).toBe(CharType.Punctuation);
            expect(CharClassify('€')).toBe(CharType.Currency);
            expect(CharClassify('👍')).toBe(CharType.Emoji);
            expect(CharClassify('©')).toBe(CharType.Symbol);
        });

        it('should classify unknown/control characters as Other', () => {
            const controlChar = String.fromCharCode(1);
            expect(CharClassify(controlChar)).toBe(CharType.Other);
        });
    });
});

// NEW & IMPROVED tests for CharacterStream to achieve 100% coverage
describe('CharacterStream', () => {
    let stream: CharacterStream;

    beforeEach(() => {
        stream = new CharacterStream('a\nbc👍');
    });

    // Covers the ternary 'else' branch in the constructor
    it('should initialize with an empty string if no input is provided', () => {
        const emptyStream = new CharacterStream();
        expect(emptyStream.get()).toBe('');
        expect(emptyStream.isEOF()).toBe(true);
    });

    it('should initialize with an empty string if no input is provided, then set the input', () => {
        const emptyStream = new CharacterStream();
        expect(emptyStream.get()).toBe('');
        expect(emptyStream.isEOF()).toBe(true);
    });

    it('should set the position using a position and then just an index', () => {
        const newPosition: Position = {
            index: 5,
            line: 2,
            column: 3
        }
        stream.setPosition(newPosition);
        expect(stream.getPosition()).toEqual({ index: 5, line: 2, column: 3 });
    });

    // Covers the 'else' branch of setPosition
    it('should set the position using index, line, and column numbers', () => {
        stream.setPosition(5, 2, 3);
        expect(stream.getPosition()).toEqual({ index: 5, line: 2, column: 3 });
    });

    it('should be iterable with for...of', () => {
        const newStream = new CharacterStream('ab');
        const chars: Character[] = [];
        for (const char of newStream) {
            chars.push(char);
        }
        expect(chars.map(c => c.value)).toEqual(['a', 'b']);
    });

    // Covers peeking past the end of the stream
    it('should handle peeking past the end of the stream', () => {
        const eofChar = stream.peek(100);
        expect(eofChar.type).toBe(CharType.EOF);
        expect(eofChar.position.index).toBe(6); // The end of the stream
    });

    // Covers the n < 0 error path in peekPosition
    it('should throw an error for a negative lookahead', () => {
        expect(() => stream.peek(-1)).toThrow("Lookahead distance `n` must be non-negative.");
    });

    // Covers calculateNextPosition with a newline
    it('should correctly peek over a newline character', () => {
        const char = stream.peek(1);
        expect(char.value).toBe('\n');
        expect(char.position).toEqual({ index: 1, line: 1, column: 2 });
    });

    // Covers the EOF branch in lookahead
    it('should return an empty string when lookahead is past EOF', () => {
        expect(stream.lookahead(100)).toBe('');
    });

    it('should return "c" as a lookahead of 2 from the input "abcde"', () => {
        const newStream = new CharacterStream('abcde');
        expect(newStream.lookahead(2)).toBe('c');
    });

    // Covers lookbackWhile on an empty buffer
    it('should return an empty array from lookbackWhile on an empty buffer', () => {
        const newStream = new CharacterStream('abc');
        expect(newStream.lookbackWhile(c => c.type === CharType.Letter)).toEqual([]);
    });

    // Covers the 'else { break }' branch of lookbackWhile
    it('should stop looking back when the predicate is false', () => {
        stream.next(); // a
        stream.next(); // \n
        stream.next(); // b
        const result = stream.lookbackWhile(c => c.type === CharType.Letter); // only 'b'
        expect(result.map(c => c.value)).toEqual(['b']);
    });

    // Covers the steps <= 0 branch in back()
    it('should not go back if steps is zero or negative', () => {
        const initialPos = stream.getPosition();
        stream.back(0);
        expect(stream.getPosition()).toEqual(initialPos);
        stream.back(-1);
        expect(stream.getPosition()).toEqual(initialPos);
    });

    // Covers the error-throwing branch in back()
    it('should throw an error when trying to go back too far', () => {
        stream.next();
        expect(() => stream.back(2)).toThrow();
    });

    // This was your original passing test, it's still good.
    it('should go back the specified number of steps', () => {
        const newStream = new CharacterStream('123');
        newStream.next(); // 1
        newStream.next(); // 2
        newStream.next(); // 3
        newStream.back(); // 3
        expect(newStream.peek().value).toBe('3');
        newStream.back(); // 2
        expect(newStream.peek().value).toBe('2');
        newStream.back(); // 1 <-- currently causes an error
        expect(newStream.peek().value).toBe('1');
    });

    // Full suite for mark/reset/commit to cover all branches
    describe('mark, reset, and commit', () => {
        it('should throw errors when resetting or committing without a mark', () => {
            expect(() => stream.reset()).toThrow("Cannot reset. No mark has been set.");
            expect(() => stream.commit()).toThrow("Cannot commit. No mark has been set.");
        });

        it('should reset to a marked position', () => {
            stream.next(); // consume 'a'
            stream.mark();
            const markedPosition = stream.getPosition();

            stream.next(); // consume '\n'
            stream.next(); // consume 'b'

            stream.reset();
            expect(stream.getPosition()).toEqual(markedPosition);
            expect(stream.peek().value).toBe('\n');
        });

        // Covers the 'else' branch of the ternary in reset()
        it('should reset to the beginning if the mark was at the start', () => {
            stream.mark();
            stream.next();
            stream.reset();
            expect(stream.getPosition()).toEqual({ index: 0, line: 1, column: 1 });
        });

        it('should commit a mark, making it un-resettable', () => {
            stream.mark();
            stream.next();
            stream.commit();
            expect(() => stream.reset()).toThrow("Cannot reset. No mark has been set.");
        });
    });

    // Covers no-argument versions of isEOF and atEOF
    it('should call isEOF and atEOF without arguments', () => {
        const newStream = new CharacterStream('a');
        expect(newStream.isEOF()).toBe(false);
        newStream.next();
        expect(newStream.isEOF()).toBe(true);

        const eofChar = newStream.atEOF();
        expect(eofChar.type).toBe(CharType.EOF);
    });

    // Covers the atError method
    it('should return an error character from atError', () => {
        const errChar = stream.atError();
        expect(errChar.type).toBe(CharType.Other);
        expect(errChar.value).toBe('Error');
        expect(errChar.position).toEqual(stream.getPosition());
    });

    it('should consume characters while a predicate is true', () => {
        const newStream = new CharacterStream('123a');
        const consumed = newStream.consumeWhile(c => c.type === CharType.Number);
        expect(consumed.length).toBe(3);
        expect(newStream.peek().value).toBe('a');
    });
});

describe('Character Utility', () => {
    describe('CharClassify', () => {
        it('should classify ASCII symbols correctly', () => {
            expect(CharClassify('#')).toBe(CharType.Hash);
            expect(CharClassify('+')).toBe(CharType.Plus);
        });

        it('should classify Unicode letters and numbers', () => {
            expect(CharClassify('é')).toBe(CharType.Letter);
            expect(CharClassify('５')).toBe(CharType.Number); // Full-width 5
        });

        it('should classify Emojis and Currency', () => {
            expect(CharClassify('🚀')).toBe(CharType.Emoji);
            expect(CharClassify('€')).toBe(CharType.Currency);
        });

        it('should handle EOF and error cases', () => {
            expect(CharClassify('')).toBe(CharType.EOF);
            expect((CharClassify as any)(null)).toBe(CharType.Error);
        });
    });

    describe('CharacterStream', () => {
        it('should handle multi-byte Unicode and track positions', () => {
            const stream = new CharacterStream('A\n🚀');
            const char1 = stream.next().value; // A
            const char2 = stream.next().value; // \n
            const char3 = stream.next().value; // 🚀

            expect(char1.position.column).toBe(1);
            expect(char2.type).toBe(CharType.NewLine);
            expect(char3.position.line).toBe(2);
            expect(char3.position.column).toBe(1);
            expect(char3.value).toBe('🚀');
        });

        describe('Speculative Parsing (Mark/Reset/Commit)', () => {
            it('should backtrack correctly on reset', () => {
                const stream = new CharacterStream('abcdef');
                stream.next(); // a
                stream.mark();
                stream.next(); // b
                stream.next(); // c

                expect(stream.peek().value).toBe('d');
                stream.reset();
                expect(stream.peek().value).toBe('b');
            });

            it('should discard marks on commit', () => {
                const stream = new CharacterStream('abc');
                stream.mark();
                stream.next();
                stream.commit();
                expect(() => stream.reset()).toThrow();
            });
        });

        describe('History and Lookback', () => {
            it('should lookbackWhile based on a predicate', () => {
                const stream = new CharacterStream('  abc');

                // Consume the two whitespace characters
                stream.next();
                stream.next();

                // The history buffer now correctly contains [' ', ' '].
                // Let's test the lookback from this state.
                const spaces = stream.lookbackWhile(c => c.type === CharType.Whitespace);

                // This assertion will now pass.
                expect(spaces.length).toBe(2);

                // You can even add a more specific check.
                expect(spaces.map(c => c.value)).toEqual([' ', ' ']);
            });

            it('should go back n steps manually', () => {
                const stream = new CharacterStream('123');
                stream.next();
                stream.next();
                stream.back(1);
                expect(stream.peek().value).toBe('2');
            });
        });

        it('should consumeWhile a predicate is true', () => {
            const stream = new CharacterStream('123abc');
            const numbers = stream.consumeWhile(c => c.type === CharType.Number);
            expect(numbers.map(n => n.value).join('')).toBe('123');
            expect(stream.peek().value).toBe('a');
        });
    });

    it('should exercise logging methods', () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        const stream = new CharacterStream('hi');

        // Enable logging and consume the stream
        stream.withLogging('Testing Log').next();
        stream.next(); // This triggers the EOF footer log

        expect(logSpy).toHaveBeenCalled();
        logSpy.mockRestore();
    });
});





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test/Character.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test/Tokenizer.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/tests/Tokenizer.test.ts

import { describe, it, expect, vi } from 'vitest';
import CharacterStream from '../src/Character';
import { Tokenizer, type Token } from '../src/Tokenizer';
import { State, TokenType } from '../src/types/Types.ts';

describe('Tokenizer', () => {
    // Helper function to streamline testing
    const tokenizeString = (input: string): Token[] => {
        const stream = new CharacterStream(input);
        const tokenizer = new Tokenizer();
        // We slice the EOF token for easier comparison in most tests
        return tokenizer.tokenize(stream).slice(0, -1);
    };

    describe('Simple Tokenization', () => {
        it('should return only EOF for an empty string', () => {
            const stream = new CharacterStream('');
            const tokenizer = new Tokenizer();
            const tokens = tokenizer.tokenize(stream);
            expect(tokens).toEqual([{ value: '', type: TokenType.END }]);
        });

        it('should tokenize a single identifier', () => {
            const tokens = tokenizeString('hello');
            expect(tokens).toEqual([{ value: 'hello', type: TokenType.IDENTIFIER }]);
        });

        it('should tokenize an identifier with numbers', () => {
            const tokens = tokenizeString('var123');
            expect(tokens).toEqual([{ value: 'var123', type: TokenType.IDENTIFIER }]);
        });

        it('should tokenize a single integer', () => {
            const tokens = tokenizeString('12345');
            expect(tokens).toEqual([{ value: '12345', type: TokenType.NUMBER }]);
        });

        it('should tokenize a floating-point number', () => {
            const tokens = tokenizeString('123.45');
            expect(tokens).toEqual([{ value: '123.45', type: TokenType.NUMBER }]);
        });

        it('should tokenize a hex value', () => {
            const tokens = tokenizeString('#ff00ff');
            expect(tokens).toEqual([{ value: '#ff00ff', type: TokenType.HEXVALUE }]);
        });
    });

    describe('Keywords', () => {
        it('should tokenize "hsl" as a FUNCTION', () => {
            const tokens = tokenizeString('hsl');
            expect(tokens).toEqual([{ value: 'hsl', type: TokenType.FUNCTION }]);
        });

        it('should tokenize "const" as a KEYWORD', () => {
            const tokens = tokenizeString('const');
            expect(tokens).toEqual([{ value: 'const', type: TokenType.KEYWORD }]);
        });

        it('should tokenize "let" as a KEYWORD', () => {
            const tokens = tokenizeString('let');
            expect(tokens).toEqual([{ value: 'let', type: TokenType.KEYWORD }]);
        });

        it('should tokenize "for" as a KEYWORD', () => {
            const tokens = tokenizeString('for');
            expect(tokens).toEqual([{ value: 'for', type: TokenType.KEYWORD }]);
        });

        it('should tokenize "red" as a KEYWORD', () => {
            const tokens = tokenizeString('red');
            expect(tokens).toEqual([{ value: 'red', type: TokenType.KEYWORD }]);
        });

        it('should tokenize "green" as a KEYWORD', () => {
            const tokens = tokenizeString('green');
            expect(tokens).toEqual([{ value: 'green', type: TokenType.KEYWORD }]);
        });

        it('should differentiate keywords from identifiers', () => {
            const tokens = tokenizeString('letter');
            expect(tokens).toEqual([{ value: 'letter', type: TokenType.IDENTIFIER }]);
        });
    });

    describe('Strings and Escape Sequences', () => {
        it('should tokenize a simple double-quoted string', () => {
            const tokens = tokenizeString('"hello world"');
            expect(tokens).toEqual([{ value: 'hello world', type: TokenType.STRING }]);
        });

        it('should tokenize a simple single-quoted string', () => {
            const tokens = tokenizeString("'hello world'");
            expect(tokens).toEqual([{ value: 'hello world', type: TokenType.STRING }]);
        });

        it('should handle an unclosed string by tokenizing its content', () => {
            const tokens = tokenizeString('"hello');
            expect(tokens).toEqual([{ value: 'hello', type: TokenType.STRING }]);
        });

        it('should unescape basic escape sequences within a string', () => {
            const tokens = tokenizeString(`"line1\\nline2\\t'quote'\\"dquote\\\\"`);
            expect(tokens).toEqual([{ value: "line1\nline2\t'quote'\"dquote\\", type: TokenType.STRING }]);
        });

        it('should unescape unicode and hex escape sequences', () => {
            const tokens = tokenizeString(`"\\u20AC and \\x2A"`);
            expect(tokens).toEqual([{ value: '€ and *', type: TokenType.STRING }]);
        });

        it('should unescape unicode and hex escape sequences', () => {
            const tokens = tokenizeString(`"\\u20AC and \\x2A"`);
            expect(tokens).toEqual([{ value: '€ and *', type: TokenType.STRING }]);
        });
    });

    describe('Symbols and Operators', () => {
        it('should tokenize specific symbols like PLUS and LPAREN', () => {
            const tokens = tokenizeString('1+(');
            expect(tokens).toEqual([
                { value: '1', type: TokenType.NUMBER },
                { value: '+', type: TokenType.PLUS },
                { value: '(', type: TokenType.LPAREN },
            ]);
        });

        it('should tokenize a series of single-character symbols', () => {
            const tokens = tokenizeString('=+/-\*');
            // FIX: The order of expected tokens now matches the input string.
            expect(tokens).toEqual([
                { value: '=', type: TokenType.EQUALS },
                { value: '+', type: TokenType.PLUS },
                { value: '/', type: TokenType.SLASH },
                { value: '-', type: TokenType.MINUS },
                { value: '*', type: TokenType.STAR },
            ]);
        });

        it('should tokenize symbols adjacent to other tokens', () => {
            const tokens = tokenizeString('a=1');
            expect(tokens).toEqual([
                { value: 'a', type: TokenType.IDENTIFIER },
                { value: '=', type: TokenType.EQUALS },
                { value: '1', type: TokenType.NUMBER },
            ]);
        });
    });

    describe('Complex Tokenization', () => {
        it('should tokenize a dimension value', () => {
            const tokens = tokenizeString('180deg');
            expect(tokens).toEqual([{ value: '180deg', type: TokenType.DIMENSION }]);
        });

        it('should tokenize a full variable declaration', () => {
            const tokens = tokenizeString('let name = "John";');
            // FIX: Expect EQUALS and a generic SYMBOL for the semicolon.
            expect(tokens).toEqual([
                { value: 'let', type: TokenType.KEYWORD },
                { value: 'name', type: TokenType.IDENTIFIER },
                { value: '=', type: TokenType.EQUALS },
                { value: 'John', type: TokenType.STRING },
                { value: ';', type: TokenType.SYMBOL }, // ';' doesn't have a specific type yet
            ]);
        });

        it('should tokenize a complex line with mixed spacing', () => {
            const tokens = tokenizeString('const  value=123.45  ;for');
            // FIX: Expect EQUALS and a generic SYMBOL for the semicolon.
            expect(tokens).toEqual([
                { value: 'const', type: TokenType.KEYWORD },
                { value: 'value', type: TokenType.IDENTIFIER },
                { value: '=', type: TokenType.EQUALS },
                { value: '123.45', type: TokenType.NUMBER },
                { value: ';', type: TokenType.SYMBOL },
                { value: 'for', type: TokenType.KEYWORD },
            ]);
        });

        it('should handle tokens at the very end of input', () => {
            const tokens = tokenizeString('let x = 123');
            // FIX: Expect EQUALS instead of SYMBOL.
            expect(tokens).toEqual([
                { value: 'let', type: TokenType.KEYWORD },
                { value: 'x', type: TokenType.IDENTIFIER },
                { value: '=', type: TokenType.EQUALS },
                { value: '123', type: TokenType.NUMBER },
            ]);
        });
    });

    describe('Tokenizer Logging and Edge Cases', () => {
        it('should correctly run with logging enabled', () => {
            // vitest.spyOn allows us to "watch" console.log without actually printing to the test output
            const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            const stream = new CharacterStream('let x = 1;');
            const tokenizer = new Tokenizer();

            // This exercises withLogging(), logHeader(), logSource(), and logResults()
            tokenizer.withLogging('Test Message').tokenize(stream);

            // This exercises withLogging(), logHeader(), logSource(), and logResults()
            tokenizer.withLogging().tokenize(stream);

            // Check that console.log was called multiple times, confirming logs were generated
            expect(logSpy).toHaveBeenCalled();

            // Clean up the spy
            logSpy.mockRestore();
        });

        it('should handle an empty buffer in createToken gracefully', () => {
            const tokenizer = new Tokenizer();
            // This test covers the error-throwing path in createToken.
            // We need to access the private method, which is okay for testing purposes.
            expect(() => (tokenizer as any).createToken('STRING')).toThrow('Cannot create token from empty buffer');
        });

        it('should run without logging', () => {
            const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            const stream = new CharacterStream('let x = 1;');
            const tokenizer = new Tokenizer();

            // This ensures the withoutLogging method works as expected
            tokenizer.withLogging().withoutLogging().tokenize(stream);

            expect(logSpy).not.toHaveBeenCalled();
            logSpy.mockRestore();
        });
    });

    describe('Comments', () => {
        it('should tokenize a single-line comment', () => {
            const tokens = tokenizeString('// this is a comment\nnext');
            expect(tokens).toEqual([
                { value: '// this is a comment', type: TokenType.COMMENT },
                { value: 'next', type: TokenType.IDENTIFIER }
            ]);
        });

        it('should tokenize a multi-line comment and preserve the closing slash', () => {
            const tokens = tokenizeString('/* hello */ next');
            expect(tokens).toEqual([
                { value: '/* hello */', type: TokenType.COMMENT },
                { value: 'next', type: TokenType.IDENTIFIER }
            ]);
        });
    });

    describe('Percentages and Dimensions', () => {
        it('should tokenize a percentage value', () => {
            const tokens = tokenizeString('100%');
            expect(tokens).toEqual([{ value: '100%', type: TokenType.PERCENT }]);
        });

        it('should tokenize dimensions like rad and turn', () => {
            const tokens = tokenizeString('90deg 1turn');
            expect(tokens).toEqual([
                { value: '90deg', type: TokenType.DIMENSION },
                { value: '1turn', type: TokenType.DIMENSION }
            ]);
        });
    });

    describe('State Machine Transitions (Reprocessing)', () => {
        it('should handle immediate reprocessing when a symbol follows a number', () => {
            // The '2' finishes the number, the '+' must be reprocessed in INITIAL state
            const tokens = tokenizeString('12+34');
            expect(tokens).toEqual([
                { value: '12', type: TokenType.NUMBER },
                { value: '+', type: TokenType.PLUS },
                { value: '34', type: TokenType.NUMBER }
            ]);
        });
    });
});





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test/Tokenizer.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████
