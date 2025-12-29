// tests/Tokenizer.test.ts

import { describe, it, expect, vi } from 'vitest';
import { Tokenizer, TokenType } from '../src/Tokenizer';
import { Character, CharType } from '../src/Character';

describe('Tokenizer', () => {
    it('should tokenize a simple string', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenizeString('word 123');
        expect(tokens).toEqual([
            { value: 'word', type: TokenType.IDENTIFIER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '123', type: TokenType.NUMBER },
        ]);
    });

    it('should tokenize a CSS rgba color string', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenizeString('rgba(100 128 255 / 0.5)');
        expect(tokens).toEqual([
            { value: 'rgba', type: TokenType.IDENTIFIER },
            { value: '(', type: TokenType.LPAREN },
            { value: '100', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '128', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '255', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '/', type: TokenType.SLASH },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '0', type: TokenType.NUMBER },
            { value: '.', type: TokenType.OPERATOR },
            { value: '5', type: TokenType.NUMBER },
            { value: ')', type: TokenType.RPAREN },
        ]);
    });

    it('should tokenize a hex color string', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenizeString('#ff00ff00');
        expect(tokens).toEqual([
            { value: '#ff00ff00', type: TokenType.HEXVALUE },
        ]);
    });

    it('should get characters from a string', () => {
        const tokenizer = new Tokenizer();
        const characters = tokenizer.getCharacters('a 1');
        expect(characters).toHaveLength(3);
        expect(characters[0]?.value).toBe('a');
        expect(characters[1]?.value).toBe(' ');
        expect(characters[2]?.value).toBe('1');
    });

    it('should tokenize an array of characters', () => {
        const tokenizer = new Tokenizer();
        const characters: Character[] = [
            {
                value: 'w',
                type: CharType.Letter,
                index: 0,
                line: 1,
                column: 1,
            },
            {
                value: 'o',
                type: CharType.Letter,
                index: 1,
                line: 1,
                column: 2,
            },
            {
                value: 'r',
                type: CharType.Letter,
                index: 2,
                line: 1,
                column: 3,
            },
            {
                value: 'd',
                type: CharType.Letter,
                index: 3,
                line: 1,
                column: 4,
            },
        ];
        const tokens = tokenizer.tokenizeCharacters(characters);
        expect(tokens).toEqual([{ value: 'word', type: TokenType.IDENTIFIER }]);
    });

    it('should enable and disable logging', () => {
        const tokenizer = new Tokenizer();
        const consoleSpy = vi.spyOn(console, 'log');

        tokenizer.withLogging('Test').tokenizeString('a');
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockClear();

        tokenizer.withoutLogging().tokenizeString('a');
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should log correctly when tokenizing a character array', () => {
        const tokenizer = new Tokenizer();
        const consoleSpy = vi.spyOn(console, 'log');

        const chars = tokenizer.getCharacters('hi');
        tokenizer.withLogging('Test Array').tokenizeCharacters(chars);

        // Check for the "x characters" message (line 108)
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('SOURCE:\t2 characters'));
        consoleSpy.mockRestore();
    });

    it('should log correctly when getting characters', () => {
        const tokenizer = new Tokenizer();
        const consoleSpy = vi.spyOn(console, 'log');

        tokenizer.withLogging('Test Get Chars').getCharacters('hi');

        // Check for the "x CHARACTERS" message (line 141)
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('RESULT (2 CHARACTERS):'));
        consoleSpy.mockRestore();
    });
});