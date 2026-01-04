// @ts-nocheck


// ==================== Start of file: tests/Character.test.ts ====================

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



// ==================== End of file: tests/Character.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/Context.test.ts ====================

// tests/Context.test.ts

import { describe, it, expect } from 'vitest';
import { Context } from '../src/Context';
import { CharType, type Character } from '../src/Character';
import { Initial_State } from '../src/States';

function ch(
    value: string,
    type: CharType,
    index = 0,
    line = 1,
    column = 1
): Character {
    return { value, type, index, line, column };
}

describe('Context – processCharacters()', () => {
    it('emits letters individually', () => {
        const ctx = new Context(Initial_State.instance);

        const a = ctx.processCharacters(ch('a', CharType.Letter));
        const b = ctx.processCharacters(ch('b', CharType.Letter));

        expect(a?.value).toBe('a');
        expect(b?.value).toBe('b');
    });

    it('emits numbers individually', () => {
        const ctx = new Context(Initial_State.instance);

        const n = ctx.processCharacters(ch('5', CharType.Number));

        expect(n?.value).toBe('5');
    });

    it('does not emit on EOF', () => {
        const ctx = new Context(Initial_State.instance);

        const r = ctx.processCharacters(
            ch('', CharType.EOF)
        );

        expect(r).toBeNull();
    });
});

describe('Context – processTokens()', () => {
    it('emits a letter token on state change', () => {
        const ctx = new Context(Initial_State.instance);

        ctx.processTokens(ch('a', CharType.Letter, 0, 1, 1));
        const token = ctx.processTokens(ch(' ', CharType.Whitespace, 1, 1, 2));

        expect(token).not.toBeNull();
        expect(token!.value).toBe('a');
        expect(token!.type).toBe(CharType.Letter);
    });

    it('accumulates multi-digit numbers', () => {
        const ctx = new Context(Initial_State.instance);

        ctx.processTokens(ch('1', CharType.Number));
        ctx.processTokens(ch('2', CharType.Number));
        const token = ctx.processTokens(ch(' ', CharType.Whitespace));

        expect(token!.value).toBe('12');
        expect(token!.type).toBe(CharType.Number);
    });

    it('emits buffered token on EOF', () => {
        const ctx = new Context(Initial_State.instance);

        ctx.processTokens(ch('9', CharType.Number));
        const token = ctx.processTokens(ch('', CharType.EOF));

        expect(token).not.toBeNull();
        expect(token!.value).toBe('9');
    });

    it('handles percent numbers correctly', () => {
        const ctx = new Context(Initial_State.instance);

        ctx.processTokens(ch('1', CharType.Number));
        ctx.processTokens(ch('0', CharType.Number));
        const token = ctx.processTokens(ch('%', CharType.Percent));

        expect(token).not.toBeNull();
        expect(token!.value).toBe('10');
    });
});

// ==================== End of file: tests/Context.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/index.test.ts ====================

// tests/index.test.ts

import { describe, it, expect } from 'vitest';
import { Tokenizer, TokenType } from '../src/Tokenizer';
import { Character, CharType } from '../src/Character';

describe('End-to-End Tokenization Tests from index.ts', () => {
    it('Test 1: should correctly tokenize a mixed string', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenizeString('67 a b c 1 word 2 3+2-0');

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

    it('Test 2 & 3: should get characters and then tokenize them', () => {
        const tokenizer = new Tokenizer();
        const characters = tokenizer.getCharacters('67 a b c 1 word 2 3+2-0');
        const tokens = tokenizer.tokenizeCharacters(characters);
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

    it('Test 4: should get characters and then tokenize them without logging', () => {
        const tokenizer = new Tokenizer();
        const newChar = tokenizer.getCharacters('quick test');
        const tokens = tokenizer.tokenizeCharacters(newChar);
        expect(tokens).toEqual([
            { value: 'quick', type: TokenType.IDENTIFIER },
            { value: ' ', type: TokenType.WHITESPACE },
            { value: 'test', type: TokenType.IDENTIFIER },
        ]);
    });

    it('Test 5: should tokenize a CSS rgba color string with spaces', () => {
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

    it('Test 6: should tokenize a CSS rgba color string with percentages', () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenizeString('rgba(100% 360 220  / 50%)');
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
        const tokens = tokenizer.tokenizeString('#ff00ff00');
        expect(tokens).toEqual([
            { value: '#ff00ff00', type: TokenType.HEXVALUE },
        ]);
    });
});

// ==================== End of file: tests/index.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/Parser.test.ts ====================

import { describe, it, expect } from 'vitest';
import { Tokenizer } from '../src/Tokenizer.ts';
import { Parser } from '../src/Parser.ts';
import { NodeType } from '../src/AST.ts';
import type {
    Program,
    BinaryExpression,
    CallExpression,
    NumericLiteral,
    HexLiteral,
    PercentLiteral,
    Identifier,
    UnaryExpression,
    GroupExpression
} from '../src/AST.ts';

describe('Parser', () => {
    const parseInput = (input: string): Program => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenizeString(input);
        const parser = new Parser(tokens);
        return parser.parse();
    };

    it('should parse number literals', () => {
        const ast = parseInput('42');
        expect(ast.body).toHaveLength(1);
        expect(ast.body[0]!.type).toBe(NodeType.ExpressionStatement);
        const expr = ast.body[0]!.expression as NumericLiteral;
        expect(expr.type).toBe(NodeType.NumericLiteral);
        expect(expr.value).toBe(42);
    });

    it('should parse addition', () => {
        const ast = parseInput('1 + 2');
        const expr = ast.body[0]!.expression as BinaryExpression;
        expect(expr.type).toBe(NodeType.BinaryExpression);
        expect(expr.operator).toBe('+');
        expect((expr.left as NumericLiteral).value).toBe(1);
        expect((expr.right as NumericLiteral).value).toBe(2);
    });

    it('should parse operator precedence', () => {
        const ast = parseInput('2 + 3 * 4');
        const expr = ast.body[0]!.expression as BinaryExpression;
        expect(expr.operator).toBe('+');
        expect((expr.left as NumericLiteral).value).toBe(2);

        const right = expr.right as BinaryExpression;
        expect(right.operator).toBe('*');
        expect((right.left as NumericLiteral).value).toBe(3);
        expect((right.right as NumericLiteral).value).toBe(4);
    });

    it('should parse function calls', () => {
        const ast = parseInput('rgb(255, 0, 0)');
        const expr = ast.body[0]!.expression as CallExpression;
        expect(expr.type).toBe(NodeType.CallExpression);
        expect(expr.callee.name).toBe('rgb');
        expect(expr.arguments).toHaveLength(3);
        expect((expr.arguments[0] as NumericLiteral).value).toBe(255);
        expect((expr.arguments[1] as NumericLiteral).value).toBe(0);
        expect((expr.arguments[2] as NumericLiteral).value).toBe(0);
    });

    it('should parse hex literals', () => {
        const ast = parseInput('#ff0000');
        const expr = ast.body[0]!.expression as HexLiteral;
        expect(expr.type).toBe(NodeType.HexLiteral);
        expect(expr.value).toBe('#ff0000');
    });

    it('should parse percentage literals', () => {
        const ast = parseInput('50%');
        const expr = ast.body[0]!.expression as PercentLiteral;
        expect(expr.type).toBe(NodeType.PercentLiteral);
        expect(expr.value).toBe(50);
        expect(expr.raw).toBe('50%');
    });

    it('should parse unary operators', () => {
        const ast = parseInput('-5');
        const expr = ast.body[0]!.expression as UnaryExpression;
        expect(expr.type).toBe(NodeType.UnaryExpression);
        expect(expr.operator).toBe('-');
        expect((expr.argument as NumericLiteral).value).toBe(5);
    });

    it('should parse grouped expressions', () => {
        const ast = parseInput('(1 + 2) * 3');
        const expr = ast.body[0]!.expression as BinaryExpression;
        expect(expr.operator).toBe('*');
        expect((expr.left as GroupExpression).type).toBe(NodeType.GroupExpression);

        const grouped = (expr.left as GroupExpression).expression as BinaryExpression;
        expect(grouped.operator).toBe('+');
        expect((grouped.left as NumericLiteral).value).toBe(1);
        expect((grouped.right as NumericLiteral).value).toBe(2);

        expect((expr.right as NumericLiteral).value).toBe(3);
    });
});
// ==================== End of file: tests/Parser.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/States.test.ts ====================

import { describe, it, expect } from 'vitest';

import {
    Initial_State,
    Letter_State,
    Number_State,
    Operator_State,
    Whitespace_State,
    Hex_State,
    Percent_State,
    End_State,
} from '../src/States';

import { CharType, type Character } from '../src/Character';
import type { Transition } from '../src/Transition';
import type { State } from '../src/States';

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

function char(
    value: string,
    type: CharType
): Character {
    return {
        value,
        type,
        index: 0,
        line: 1,
        column: 1,
    };
}

function expectTo(
    t: Transition,
    state: State
) {
    expect(t.kind).toBe('To');
    if (t.kind === 'To') {
        expect(t.state).toBe(state);
    }
}

function expectEmitAndTo(
    t: Transition,
    state: State
) {
    expect(t.kind).toBe('EmitAndTo');
    if (t.kind === 'EmitAndTo') {
        expect(t.state).toBe(state);
    }
}

function expectStay(t: Transition) {
    expect(t.kind).toBe('Stay');
}

function expectEnd(t: Transition) {
    expect(t.kind).toBe('End');
}

/* -------------------------------------------------- */
/* Initial State                                      */
/* -------------------------------------------------- */

describe('Initial_State', () => {
    it('routes letters to Letter_State', () => {
        const t = Initial_State.instance.handle(
            char('a', CharType.Letter)
        );

        expectTo(t, Letter_State.instance);
    });

    it('routes numbers to Number_State', () => {
        const t = Initial_State.instance.handle(
            char('1', CharType.Number)
        );

        expectTo(t, Number_State.instance);
    });

    it('routes operators to Operator_State', () => {
        const t = Initial_State.instance.handle(
            char('+', CharType.Operator)
        );

        expectTo(t, Operator_State.instance);
    });

    it('routes whitespace to Whitespace_State', () => {
        const t = Initial_State.instance.handle(
            char(' ', CharType.Whitespace)
        );

        expectTo(t, Whitespace_State.instance);
    });

    it('routes # to Hex_State', () => {
        const t = Initial_State.instance.handle(
            char('#', CharType.Hash)
        );

        expectTo(t, Hex_State.instance);
    });

    it('routes EOF to End_State', () => {
        const t = Initial_State.instance.handle(
            char('', CharType.EOF)
        );

        expectTo(t, End_State.instance);
    });
});

/* -------------------------------------------------- */
/* Letter State                                       */
/* -------------------------------------------------- */

describe('Letter_State', () => {
    it('stays on letters', () => {
        const t = Letter_State.instance.handle(
            char('b', CharType.Letter)
        );

        expectStay(t);
    });

    it('emits and returns to Initial on non-letter', () => {
        const t = Letter_State.instance.handle(
            char('1', CharType.Number)
        );

        expectEmitAndTo(t, Initial_State.instance);
    });
});

/* -------------------------------------------------- */
/* Number State                                       */
/* -------------------------------------------------- */

describe('Number_State', () => {
    it('stays on digits', () => {
        const t = Number_State.instance.handle(
            char('2', CharType.Number)
        );

        expectStay(t);
    });

    it('transitions to Percent_State on %', () => {
        const t = Number_State.instance.handle(
            char('%', CharType.Percent)
        );

        expectTo(t, Percent_State.instance);
    });

    it('emits and returns to Initial on non-digit', () => {
        const t = Number_State.instance.handle(
            char('+', CharType.Operator)
        );

        expectEmitAndTo(t, Initial_State.instance);
    });
});

/* -------------------------------------------------- */
/* Percent State                                      */
/* -------------------------------------------------- */

describe('Percent_State', () => {
    it('stays on %', () => {
        const t = Percent_State.instance.handle(
            char('%', CharType.Percent)
        );

        expectStay(t);
    });

    it('emits and returns to Initial on other input', () => {
        const t = Percent_State.instance.handle(
            char(' ', CharType.Whitespace)
        );

        expectEmitAndTo(t, Initial_State.instance);
    });
});

/* -------------------------------------------------- */
/* Operator State                                     */
/* -------------------------------------------------- */

describe('Operator_State', () => {
    it('stays on operator', () => {
        const t = Operator_State.instance.handle(
            char('+', CharType.Operator)
        );

        expectStay(t);
    });

    it('emits and returns to Initial on non-operator', () => {
        const t = Operator_State.instance.handle(
            char('a', CharType.Letter)
        );

        expectEmitAndTo(t, Initial_State.instance);
    });
});

/* -------------------------------------------------- */
/* Whitespace State                                   */
/* -------------------------------------------------- */

describe('Whitespace_State', () => {
    it('stays on whitespace', () => {
        const t = Whitespace_State.instance.handle(
            char(' ', CharType.Whitespace)
        );

        expectStay(t);
    });

    it('emits and returns to Initial on non-whitespace', () => {
        const t = Whitespace_State.instance.handle(
            char('a', CharType.Letter)
        );

        expectEmitAndTo(t, Initial_State.instance);
    });
});

/* -------------------------------------------------- */
/* End State                                          */
/* -------------------------------------------------- */

describe('End_State', () => {
    it('ends on EOF', () => {
        const t = End_State.instance.handle(
            char('', CharType.EOF)
        );

        expectEnd(t);
    });

    it('emits and returns to Initial if input appears after EOF', () => {
        const t = End_State.instance.handle(
            char('a', CharType.Letter)
        );

        expectEmitAndTo(t, Initial_State.instance);
    });
});

// ==================== End of file: tests/States.test.ts ====================





// @ts-nocheck


// ==================== Start of file: tests/Tokenizer.test.ts ====================

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
// ==================== End of file: tests/Tokenizer.test.ts ====================





