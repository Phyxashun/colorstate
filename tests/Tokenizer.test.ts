import { describe, it, expect } from 'vitest';
import { Tokenizer, TokenType } from '../src/Tokenizer';

describe('Tokenizer', () => {
    it('tokenizes identifiers and numbers', () => {
        const tokens = new Tokenizer().tokenize('foo 123');
        expect(tokens.map(t => t.type)).toContain(TokenType.IDENTIFIER);
        expect(tokens.map(t => t.type)).toContain(TokenType.NUMBER);
    });

    it('tokenizes strings', () => {
        const tokens = new Tokenizer().tokenize("'abc'");
        const str = tokens.find(t => t.type === TokenType.STRING);
        expect(str?.value).toBe('abc');
    });

    it('tokenizes hex colors', () => {
        const tokens = new Tokenizer().tokenize('#ff00ff');
        expect(tokens[0].type).toBe(TokenType.HEXVALUE);
    });

    it('tokenizes percentages and dimensions', () => {
        const tokens = new Tokenizer().tokenize('50% 90deg');
        expect(tokens.some(t => t.type === TokenType.PERCENT)).toBe(true);
        expect(tokens.some(t => t.type === TokenType.DIMENSION)).toBe(true);
    });
});
