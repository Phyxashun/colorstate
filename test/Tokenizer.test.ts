// src/tests/Tokenizer.test.ts

import { describe, it, expect, vi } from 'vitest';
import CharacterStream from '../src/Character';
import { Tokenizer, type Token } from '../src/Tokenizer';
import { State, TokenType } from '../types/Types.ts';

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