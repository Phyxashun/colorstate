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



