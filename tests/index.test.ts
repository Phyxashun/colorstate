// tests/index.test.ts

import { describe, it, expect } from 'vitest';
import { Tokenizer, TokenType } from '../src/Tokenizer';

describe('End-to-End Tokenization Tests from index.ts', () => {
    it('Test 1: should correctly tokenize a mixed string', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize('67 a b c 1 word 2 3+2-0');

        expect(tokens).toEqual([
            { value: '67', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: 'a', type: TokenType.IDENTIFIER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: 'b', type: TokenType.IDENTIFIER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: 'c', type: TokenType.IDENTIFIER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '1', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: 'word', type: TokenType.IDENTIFIER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '2', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '3', type: TokenType.NUMBER },
            { value: '+', type: TokenType.PLUS },
            { value: '2', type: TokenType.NUMBER },
            { value: '-', type: TokenType.MINUS },
            { value: '0', type: TokenType.NUMBER },
        ]);
    });

    it('Test 5: should tokenize a CSS rgba color string with spaces', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize('rgba(100 128 255 / 0.5)');
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
            { value: '.', type: TokenType.SYMBOL },
            { value: '5', type: TokenType.NUMBER },
            { value: ')', type: TokenType.RPAREN },
        ]);
    });

    it('Test 6: should tokenize a CSS rgba color string with percentages', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize('rgba(100% 360 220  / 50%)');
        expect(tokens).toEqual([
            { value: 'rgba', type: TokenType.IDENTIFIER },
            { value: '(', type: TokenType.LPAREN },
            { value: '100%', type: TokenType.PERCENT },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '360', type: TokenType.NUMBER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '220', type: TokenType.NUMBER },
            { value: '  ', type: TokenType.WHITESPACE },
            { value: '/', type: TokenType.SLASH },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: '50%', type: TokenType.PERCENT },
            { value: ')', type: TokenType.RPAREN },
        ]);
    });

    it('Test 7: should tokenize a hex color string', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize('#ff00ff00');
        expect(tokens).toEqual([
            { value: '#ff00ff00', type: TokenType.HEXVALUE },
        ]);
    });
});
