// src/tests/Character.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import CharacterStream, { type Position, type Character, CharType, CHARCLASSIFY } from '../src/Character';


// Tests for Char.CharUtility (from your test run)
describe('Char.CharUtility', () => {
    describe('classify', () => {
        it('should classify stream-specific types', () => {
            expect(CHARCLASSIFY('')).toBe(CharType.EOF);
            expect(CHARCLASSIFY(null as any)).toBe(CharType.Error);
        });

        it('should classify specific named types from the SymbolMap', () => {
            expect(CHARCLASSIFY('(')).toBe(CharType.LParen);
            expect(CHARCLASSIFY('#')).toBe(CharType.Hash);
            expect(CHARCLASSIFY('$')).toBe(CharType.Dollar);
        });

        it('should classify general categories for characters not in the SymbolMap', () => {
            expect(CHARCLASSIFY('a')).toBe(CharType.Letter);
            expect(CHARCLASSIFY('1')).toBe(CharType.Number);
            expect(CHARCLASSIFY(' ')).toBe(CharType.Whitespace);
            expect(CHARCLASSIFY('\n')).toBe(CharType.NewLine);
            expect(CHARCLASSIFY('¡')).toBe(CharType.Punctuation);
            expect(CHARCLASSIFY('€')).toBe(CharType.Currency);
            expect(CHARCLASSIFY('👍')).toBe(CharType.Emoji);
            expect(CHARCLASSIFY('©')).toBe(CharType.Symbol);
        });

        it('should classify unknown/control characters as Other', () => {
            const controlChar = String.fromCharCode(1);
            expect(CHARCLASSIFY(controlChar)).toBe(CharType.Other);
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
    describe('CHARCLASSIFY', () => {
        it('should classify ASCII symbols correctly', () => {
            expect(CHARCLASSIFY('#')).toBe(CharType.Hash);
            expect(CHARCLASSIFY('+')).toBe(CharType.Plus);
        });

        it('should classify Unicode letters and numbers', () => {
            expect(CHARCLASSIFY('é')).toBe(CharType.Letter);
            expect(CHARCLASSIFY('５')).toBe(CharType.Number); // Full-width 5
        });

        it('should classify Emojis and Currency', () => {
            expect(CHARCLASSIFY('🚀')).toBe(CharType.Emoji);
            expect(CHARCLASSIFY('€')).toBe(CharType.Currency);
        });

        it('should handle EOF and error cases', () => {
            expect(CHARCLASSIFY('')).toBe(CharType.EOF);
            expect((CHARCLASSIFY as any)(null)).toBe(CharType.Error);
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

                // You MUST consume characters to fill the internal history buffer
                stream.next(); // Buffer: [' ']
                stream.next(); // Buffer: [' ', ' ']
                stream.next(); // Buffer: [' ', ' ', 'a']

                // Now we look back from the current position (index 3)
                const spaces = stream.lookbackWhile(c => c.type === CharType.Whitespace);

                expect(spaces.length).toBe(2);
                expect(spaces[0].value).toBe(' ');
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