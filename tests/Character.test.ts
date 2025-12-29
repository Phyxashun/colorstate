// tests/Character.test.ts

import { describe, it, expect } from 'vitest';
import {
    Character,
    CharType,
    CharacterStream,
    CharacterArrayStream,
} from '../src/Character';

describe('Character', () => {
    it('should create a default Character', () => {
        const ch = new Character();

        expect(ch.value).toBe('');
        expect(ch.type).toBe(CharType.Start);
    });

    it('should classify characters correctly', () => {
        expect(Character.classify(' ')).toBe(CharType.Whitespace);
        expect(Character.classify('\n')).toBe(CharType.NewLine);
        expect(Character.classify('#')).toBe(CharType.Hash);
        expect(Character.classify('%')).toBe(CharType.Percent);
        expect(Character.classify('a')).toBe(CharType.Letter);
        expect(Character.classify('5')).toBe(CharType.Number);
        expect(Character.classify('+')).toBe(CharType.Operator);
        expect(Character.classify('~')).toBe(CharType.Operator);
        expect(Character.classify('EOF')).toBe(CharType.EOF);
    });
});

describe('CharacterStream', () => {
    it('should iterate over a string and produce characters', () => {
        const inputStream = new CharacterStream('a 1');
        const iterator = inputStream[Symbol.iterator]();
        let next = iterator.next();
        expect(next.done).toBe(false);
        expect(next.value).toMatchObject({ value: 'a', type: CharType.Letter });
        next = iterator.next();
        expect(next.done).toBe(false);
        expect(next.value).toMatchObject({ value: ' ', type: CharType.Whitespace });
        next = iterator.next();
        expect(next.done).toBe(false);
        expect(next.value).toMatchObject({ value: '1', type: CharType.Number });
    });

    it('should handle the end of the stream correctly', () => {
        const inputStream = new CharacterStream('a');
        const iterator = inputStream[Symbol.iterator]();
        iterator.next(); // consume 'a'
        let eof = iterator.next();
        expect(eof.done).toBe(false);
        expect(eof.value.type).toBe(CharType.EOF);
        let done = iterator.next();
        expect(done.done).toBe(true);
    });

    it('isEOF should return true only at the end of the stream', () => {
        const inputStream = new CharacterStream('a');
        expect(inputStream.isEOF()).toBe(false);
        inputStream.next();
        expect(inputStream.isEOF()).toBe(true);
    });

    it('should peek at the current character with no offset', () => {
        const inputStream = new CharacterStream('ab');
        expect(inputStream.peek()).toBe('a');
        inputStream.next();
        expect(inputStream.peek()).toBe('b');
    });

    it('should peek ahead using a positive offset', () => {
        const stream = new CharacterStream('abc');
        expect(stream.peek(0)).toBe('a');
        expect(stream.peek(1)).toBe('b');
        expect(stream.peek(2)).toBe('c');
    });

    it('should not advance the stream when peeking with an offset', () => {
        const stream = new CharacterStream('abc');
        stream.peek(2); // Peek at 'c'
        const nextChar = stream.next().value as Character;
        expect(nextChar.value).toBe('a'); // The stream should still be at the beginning
    });

    it('should return null when peeking past the end of the stream', () => {
        const stream = new CharacterStream('ab');
        expect(stream.peek(2)).toBeNull();
        expect(stream.peek(100)).toBeNull();
    });

    it('should create a stream with new lines: "\\n"', () => {
        const stream = new CharacterStream('a\nb');
        const result: Character[] = [];
        for (const c of stream) { result.push(c); }
        expect(result).toHaveLength(4);
        expect(result[1]?.type).toBe(CharType.NewLine);
        expect(result[2]?.line).toBe(2);
        expect(result[2]?.column).toBe(1);
    });
});

// The rest of your excellent test file...
describe('CharacterArrayStream', () => {
    it('should iterate over an array of characters', () => {
        const characters: Character[] = [
            { value: 'a', type: CharType.Letter, index: 0, line: 1, column: 1 },
            { value: '1', type: CharType.Number, index: 1, line: 1, column: 2 },
        ];
        const arrayStream = new CharacterArrayStream(characters);
        const iterator = arrayStream[Symbol.iterator]();
        let next = iterator.next();
        expect(next.done).toBe(false);
        expect(next.value).toEqual(characters[0]);
        next = iterator.next();
        expect(next.done).toBe(false);
        expect(next.value).toEqual(characters[1]);
    });

    it('should handle EOF correctly for character arrays', () => {
        const characters: Character[] = [{ value: 'a', type: CharType.Letter, index: 0, line: 1, column: 1 }];
        const stream = new CharacterArrayStream(characters);
        stream.next();
        const eofResult = stream.next();
        expect(eofResult.done).toBe(false);
        expect(eofResult.value.type).toBe(CharType.EOF);
        expect(stream.next().done).toBe(true);
    });

    it('should handle falsy input in Character.classify', () => {
        expect(Character.classify(null as any)).toBe(CharType.Other);
        expect(Character.classify(undefined as any)).toBe(CharType.Other);
    });

    it('should return a defined error character from atError', () => {
        const stream = new CharacterStream('');
        const errorChar = stream.atError();
        expect(errorChar.type).toBe(CharType.Other);
        expect(errorChar.value).toBe('Error');
    });

    it('should return done:true after EOF has been emitted (CharacterStream)', () => {
        const stream = new CharacterStream('');
        stream.next(); // First call emits EOF
        const result = stream.next(); // Second call should be done
        expect(result.done).toBe(true);
    });

    it('should correctly create an EOF token for an empty CharacterArrayStream', () => {
        const stream = new CharacterArrayStream([]);
        const result = stream.next();
        const eofChar = result.value as Character;
        expect(eofChar.type).toBe(CharType.EOF);
        expect(eofChar.index).toBe(0);
    });

    it('should return done:true after EOF has been emitted (CharacterArrayStream)', () => {
        const stream = new CharacterArrayStream([]);
        stream.next(); // First call emits EOF
        const result = stream.next(); // Second call should be done
        expect(result.done).toBe(true);
    });
});


