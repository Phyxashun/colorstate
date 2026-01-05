// @ts-nocheck


// ==================== Start of file: tests/Character.test.ts ====================

import { describe, it, expect } from 'vitest';
import { CharacterStream, CharType } from '../src/Character';

describe('CharacterStream', () => {
    it('iterates characters with positions', () => {
        const stream = new CharacterStream('a\nb');
        const chars = [...stream];

        expect(chars[0].value).toBe('a');
        expect(chars[0].position.line).toBe(1);

        expect(chars[1].value).toBe('\n');
        expect(chars[1].position.line).toBe(1);

        expect(chars[2].value).toBe('b');
        expect(chars[2].position.line).toBe(2);
    });

    it('produces EOF correctly', () => {
        const stream = new CharacterStream('');
        const next = stream.next();

        expect(next.done).toBe(true);
        expect(next.value.type).toBe(CharType.EOF);
    });
});

// ==================== End of file: tests/Character.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/Context.test.ts ====================

import { describe, it, expect } from 'vitest';
import { Context } from '../src/Context';
import { CharType } from '../src/Character';

describe('Context string handling', () => {
    it('opens and closes matching string quotes', () => {
        const ctx = new Context();

        ctx.beginString(CharType.SingleQuote);
        expect(ctx.isInString()).toBe(true);

        ctx.endString();
        expect(ctx.isInString()).toBe(false);
    });

    it('handles escaping correctly', () => {
        const ctx = new Context();
        ctx.setEscaping(true);
        expect(ctx.isEscaping()).toBe(true);

        ctx.setEscaping(false);
        expect(ctx.isEscaping()).toBe(false);
    });

    it('ignores endString when not in string', () => {
        const ctx = new Context();
        expect(() => ctx.endString()).not.toThrow();
    });
});

// ==================== End of file: tests/Context.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/Parser.test.ts ====================

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

// ==================== End of file: tests/Parser.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/States.test.ts ====================

import { describe, it, expect } from 'vitest';
import { InitialState, StringState } from '../src/States';
import { CharType } from '../src/Character';

describe('State transitions', () => {
    it('enters string state', () => {
        const t = InitialState.handle({
            value: '"',
            type: CharType.DoubleQuote,
            position: { index: 0, line: 1, column: 1 }
        });

        expect(t.kind).toBe('BeginString');
    });

    it('string escapes next character', () => {
        const t = StringState.handle({
            value: '\\',
            type: CharType.BackSlash,
            position: { index: 0, line: 1, column: 1 }
        });

        expect(t.kind).toBe('EscapeNext');
    });

    
});

// ==================== End of file: tests/States.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/Tokenizer.test.ts ====================

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

// ==================== End of file: tests/Tokenizer.test.ts ====================





