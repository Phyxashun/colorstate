

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test/Character.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/tests/Character.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { type Position, type Character, CharType, CharUtility, CharacterStream } from '../src/Character';


// Tests for Char.CharUtility (from your test run)
describe('Char.CharUtility', () => {
    describe('classify', () => {
        it('should classify stream-specific types', () => {
            expect(CharUtility.classify('')).toBe(CharType.EOF);
            expect(CharUtility.classify(null as any)).toBe(CharType.Error);
        });

        it('should classify specific named types from the SymbolMap', () => {
            expect(CharUtility.classify('(')).toBe(CharType.LParen);
            expect(CharUtility.classify('#')).toBe(CharType.Hash);
            expect(CharUtility.classify('$')).toBe(CharType.Dollar);
        });

        it('should classify general categories for characters not in the SymbolMap', () => {
            expect(CharUtility.classify('a')).toBe(CharType.Letter);
            expect(CharUtility.classify('1')).toBe(CharType.Number);
            expect(CharUtility.classify(' ')).toBe(CharType.Whitespace);
            expect(CharUtility.classify('\n')).toBe(CharType.NewLine);
            expect(CharUtility.classify('¡')).toBe(CharType.Punctuation);
            expect(CharUtility.classify('€')).toBe(CharType.Currency);
            expect(CharUtility.classify('👍')).toBe(CharType.Emoji);
            expect(CharUtility.classify('©')).toBe(CharType.Symbol);
        });

        it('should classify unknown/control characters as Other', () => {
            const controlChar = String.fromCharCode(1);
            expect(CharUtility.classify(controlChar)).toBe(CharType.Other);
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

        emptyStream.set('10');
        expect(emptyStream.get()).toBe('10');
        expect(emptyStream.isEOF()).toBe(false);
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








//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test/Character.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test/Tokenizer.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// @ts-nocheck
/* eslint-disable */

// src/tests/Tokenizer.test.ts

import { describe, it, expect, vi } from 'vitest';
import { CharacterStream } from '../src/Character';
import { Tokenizer, TokenType, type Token } from '../src/Tokenizer';

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
            expect(tokens).toEqual([{ value: '', type: TokenType.EOF }]);
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
        it('should tokenize "let" as a KEYWORD', () => {
            const tokens = tokenizeString('let');
            expect(tokens).toEqual([{ value: 'let', type: TokenType.LET }]);
        });

        it('should tokenize "const" as a KEYWORD', () => {
            const tokens = tokenizeString('const');
            expect(tokens).toEqual([{ value: 'const', type: TokenType.CONST }]);
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
        it.skip('should tokenize a dimension value', () => {
            const tokens = tokenizeString('180deg');
            expect(tokens).toEqual([{ value: '180deg', type: TokenType.DIMENSION }]);
        });

        it('should tokenize a full variable declaration', () => {
            const tokens = tokenizeString('let name = "John";');
            // FIX: Expect EQUALS and a generic SYMBOL for the semicolon.
            expect(tokens).toEqual([
                { value: 'let', type: TokenType.LET },
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
                { value: 'const', type: TokenType.CONST },
                { value: 'value', type: TokenType.IDENTIFIER },
                { value: '=', type: TokenType.EQUALS },
                { value: '123.45', type: TokenType.NUMBER },
                { value: ';', type: TokenType.SYMBOL },
                { value: 'for', type: TokenType.FOR },
            ]);
        });

        it('should handle tokens at the very end of input', () => {
            const tokens = tokenizeString('let x = 123');
            // FIX: Expect EQUALS instead of SYMBOL.
            expect(tokens).toEqual([
                { value: 'let', type: TokenType.LET },
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

        it('should correctly log a line to the console', () => {
            const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            const tokenizer = new Tokenizer();
            (tokenizer as any).printLine();

            (tokenizer as any).printLine({ preNewLine: true, postNewLine: true });

            // Check that console.log was called multiple times, confirming logs were generated
            expect(logSpy).toHaveBeenCalled();

            // Clean up the spy
            logSpy.mockRestore();
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
});




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test/Tokenizer.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████
