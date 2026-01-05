import { describe, it, expect } from 'vitest';
import { Tokenizer, TokenType } from '../src/Tokenizer';
import { inspect, type InspectOptions } from 'node:util';

const inspectOptions: InspectOptions = {
    showHidden: true,
    depth: null,
    colors: true,
    customInspect: false,
    showProxy: false,
    maxArrayLength: null,
    maxStringLength: null,
    breakLength: 100,
    compact: true,
    sorted: false,
    getters: false,
    numericSeparator: true,
};

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

    it('classifies unknown characters as Other', () => {
        const tokens = new Tokenizer().tokenize('©');

        expect(tokens[0].type).toBe(TokenType.SYMBOL);
    });

    it('rejects escape outside string', () => {
        const tokens = new Tokenizer().tokenize('\\a');

        expect(tokens[0].type).toBe(TokenType.SYMBOL);
    });

    it('flushes buffer at EOF', () => {
        const tokens = new Tokenizer().tokenize('abc');

        expect(tokens.at(0)?.value).toBe('abc');
    });

    it('reprocesses character after emit', () => {
        const tokens = new Tokenizer().tokenize('1+2');

        expect(tokens.map(t => t.value)).toContain('+');
    });

    it('treats backslash as symbol outside string', () => {
        const tokens = new Tokenizer().tokenize('\\a');

        expect(tokens[0].type).toBe(TokenType.SYMBOL);
    });

    it('handles escaped quotes in strings', () => {
        const tokens = new Tokenizer().tokenize("'\\''");
        console.log(inspect(tokens, inspectOptions));
        expect(tokens[0].value).toBe("'");
    });

    it('handles escaped character in strings', () => {
        const tokens = new Tokenizer().tokenize('"\\""');
        console.log(inspect(tokens, inspectOptions));
        expect(tokens[0].value).toBe('"');
    });
});
