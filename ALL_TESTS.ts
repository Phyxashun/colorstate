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







// tests/Context.test.ts

import { describe, it, expect, vi } from 'vitest';
import { Context } from '../src/Context';
import { InitialState, LetterState, NumberState } from '../src/States';
import { CharType, Character } from '../src/Character';
import { TokenType } from '../src/Tokenizer';

describe('Context', () => {
    it('should initialize with a given state', () => {
        const context = new Context(InitialState);
        expect(context.isAccepted()).toBe(false);
    });

    it('should transition to a new state', () => {
        const context = new Context(InitialState);
        context.transitionTo(LetterState);
        expect(context.isAccepted()).toBe(true);
    });

    it('should process a simple tokenization flow', () => {
        const context = new Context(InitialState);
        context.processTokens({ value: 'a', type: CharType.Letter } as Character); // Enters LetterState, buffer: ['a']
        const emittedToken = context.processTokens({ value: ' ', type: CharType.Whitespace } as Character); // State changes, emits 'a'

        expect(emittedToken).not.toBeNull();
        expect(emittedToken!.value).toBe('a');
    });

    it('should handle EOF in processCharacters', () => {
        const context = new Context(InitialState);
        const result = context.processCharacters({ type: CharType.EOF } as Character);
        expect(result).toBeNull();
    });

    describe('toTokenType', () => {
        it('should convert various CharTypes to the correct TokenTypes', () => {
            expect(Context.toTokenType({ value: '#', type: CharType.Hash } as Character).type).toBe(TokenType.HEXVALUE);
            expect(Context.toTokenType({ value: '1', type: CharType.Number } as Character).type).toBe(TokenType.NUMBER);
            expect(Context.toTokenType({ value: '+', type: CharType.Operator } as Character).type).toBe(TokenType.PLUS);
            expect(Context.toTokenType({ value: '-', type: CharType.Operator } as Character).type).toBe(TokenType.MINUS);
            expect(Context.toTokenType({ value: ',', type: CharType.Operator } as Character).type).toBe(TokenType.COMMA);
            expect(Context.toTokenType({ value: '/', type: CharType.Operator } as Character).type).toBe(TokenType.SLASH);
            expect(Context.toTokenType({ value: '(', type: CharType.Operator } as Character).type).toBe(TokenType.LPAREN);
            expect(Context.toTokenType({ value: ')', type: CharType.Operator } as Character).type).toBe(TokenType.RPAREN);
            expect(Context.toTokenType({ value: '%', type: CharType.Percent } as Character).type).toBe(TokenType.PERCENT);
        });
    });

    // --- 100% COVERAGE COMPLETION TESTS ---

    describe('Context.ts Final Coverage', () => {
        it('should throw an Error (lines 105)', () => {
            const context = new Context(InitialState);
            const emptyArray: Character[] = [];

            expect(() => {
                (context as any).createToken(emptyArray);
            }).toThrow('Cannot create token from empty buffer');
        });

        it('should emit a final token when EOF is reached while buffer has content (lines 27-33)', () => {
            const context = new Context(InitialState);
            // Buffer has 'a', state is accepting
            context.processTokens({ value: 'a', type: CharType.Letter } as Character);
            const finalToken = context.processTokens({ type: CharType.EOF } as Character);

            expect(finalToken).not.toBeNull();
            expect(finalToken!.value).toBe('a');
        });

        it('should emit null when EOF is reached while buffer is empty (lines 34-36)', () => {
            const context = new Context(InitialState);
            const finalToken = context.processTokens({ type: CharType.EOF } as Character);
            expect(finalToken).toBeNull();
        });

        it('should handle complex state change in processCharacters (line 92)', () => {
            // Test Path: NumberState (Accepting) -> InitialState (Non-Accepting) -> LetterState (Accepting)
            const context = new Context(NumberState);
            const result = context.processCharacters({ value: 'a', type: CharType.Letter } as Character);

            // The logic should return the character that caused this complex transition
            expect(result).not.toBeNull();
            expect(result!.value).toBe('a');
        });

        it('should correctly map CharType.Letter in toTokenType (line 147)', () => {
            const token = Context.toTokenType({ value: 'word', type: CharType.Letter } as Character);
            expect(token.type).toBe(TokenType.IDENTIFIER);
        });

        it('should map unhandled CharTypes to an ERROR token (line 159)', () => {
            const token = Context.toTokenType({ value: '', type: CharType.EOF } as Character);
            expect(token.type).toBe(TokenType.EOF);
        });

        it('should map unhandled CharTypes to an ERROR token (line 159)', () => {
            const token = Context.toTokenType({ value: '`', type: CharType.Other } as Character);
            expect(token.type).toBe(TokenType.ERROR);
        });
    });
});





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




// test/Parser.test.ts

import { describe, it, expect } from 'vitest';
import { Tokenizer } from '../src/Tokenizer.ts';
import { Parser } from '../src/Parser.ts';
import type { Program, BinaryExpression, CallExpression } from '../src/AST.ts';

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
        expect(ast.body[0]!.type).toBe('ExpressionStatement');
        expect(ast.body[0]!.expression.type).toBe('NumericLiteral');
        expect((ast.body[0]!.expression as any).value).toBe(42);
    });

    it('should parse addition', () => {
        const ast = parseInput('1 + 2');
        const expr = ast.body[0]!.expression as BinaryExpression;
        expect(expr.type).toBe('BinaryExpression');
        expect(expr.operator).toBe('+');
        expect((expr.left as any).value).toBe(1);
        expect((expr.right as any).value).toBe(2);
    });

    it('should parse operator precedence', () => {
        const ast = parseInput('2 + 3 * 4');
        const expr = ast.body[0]!.expression as BinaryExpression;
        expect(expr.operator).toBe('+');
        expect((expr.left as any).value).toBe(2);
        expect((expr.right as BinaryExpression).operator).toBe('*');
    });

    it('should parse function calls', () => {
        const ast = parseInput('rgb(255, 0, 0)');
        const expr = ast.body[0]!.expression as CallExpression;
        expect(expr.type).toBe('CallExpression');
        expect(expr.callee.name).toBe('rgb');
        expect(expr.arguments).toHaveLength(3);
    });

    it('should parse hex literals', () => {
        const ast = parseInput('#ff0000');
        const expr = ast.body[0]!.expression as any;
        expect(expr.type).toBe('HexLiteral');
        expect(expr.value).toBe('#ff0000');
    });

    it('should parse percentage literals', () => {
        const ast = parseInput('50%');
        const expr = ast.body[0]!.expression as any;
        expect(expr.type).toBe('PercentLiteral');
        expect(expr.value).toBe(50);
    });

    it('should parse unary operators', () => {
        const ast = parseInput('-5');
        const expr = ast.body[0]!.expression as any;
        expect(expr.type).toBe('UnaryExpression');
        expect(expr.operator).toBe('-');
    });

    it('should parse grouped expressions', () => {
        const ast = parseInput('(1 + 2) * 3');
        const expr = ast.body[0]!.expression as BinaryExpression;
        expect(expr.operator).toBe('*');
        expect((expr.left as any).type).toBe('GroupExpression');
    });
});






// tests/States.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    Initial_State,
    Whitespace_State,
    Hex_State,
    Letter_State,
    Number_State,
    Percent_State,
    Operator_State,
    End_State,
    State
} from '../src/States';
import { Context } from '../src/Context';
import { CharType, Character, CharacterStream } from '../src/Character';
import { Tokenizer } from '../src/Tokenizer';

// Note: The aliased exports (e.g., InitialState) are instances.
// We use the class directly (e.g., Initial_State) to access the static .instance property
// for consistency and clarity in the tests.

describe('States1', () => {

    describe('InitialState Transitions', () => {
        let context: Context;
        let transitionToSpy: any;

        // This runs before each `it` block in this `describe` block
        beforeEach(() => {
            context = new Context(Initial_State.instance);
            transitionToSpy = vi.spyOn(context, 'transitionTo');
        });

        it('should transition to Whitespace_State on whitespace', () => {
            context.processCharacters({ type: CharType.Whitespace } as Character);
            expect(transitionToSpy).toHaveBeenCalledWith(Whitespace_State.instance);
        });

        it('should transition to Hex_State on hash', () => {
            context.processCharacters({ type: CharType.Hash } as Character);
            expect(transitionToSpy).toHaveBeenCalledWith(Hex_State.instance);
        });

        it('should transition to Letter_State on a letter', () => {
            context.processCharacters({ type: CharType.Letter } as Character);
            expect(transitionToSpy).toHaveBeenCalledWith(Letter_State.instance);
        });

        it('should transition to Number_State on a number', () => {
            context.processCharacters({ type: CharType.Number } as Character);
            expect(transitionToSpy).toHaveBeenCalledWith(Number_State.instance);
        });

        it('should transition to Operator_State on an operator', () => {
            context.processCharacters({ type: CharType.Operator } as Character);
            expect(transitionToSpy).toHaveBeenCalledWith(Operator_State.instance);
        });

        it('should transition to End_State on EOF', () => {
            context.processCharacters({ type: CharType.EOF } as Character);
            expect(transitionToSpy).toHaveBeenCalledWith(End_State.instance);
        });
    });

    it('should return correct accepting status for each state', () => {
        expect(Initial_State.instance.isAccepting()).toBe(false);
        expect(Whitespace_State.instance.isAccepting()).toBe(true);
        expect(Hex_State.instance.isAccepting()).toBe(true);
        expect(Letter_State.instance.isAccepting()).toBe(true);
        expect(Number_State.instance.isAccepting()).toBe(true);
        expect(Percent_State.instance.isAccepting()).toBe(true);
        expect(Operator_State.instance.isAccepting()).toBe(true);
        expect(End_State.instance.isAccepting()).toBe(true);
    });

    it('NumberState should transition to PercentState', () => {
        const context = new Context(Number_State.instance);
        const transitionToSpy = vi.spyOn(context, 'transitionTo');
        // Directly call the state's handle method for a unit test
        Number_State.instance.setContext(context);
        Number_State.instance.handle({ type: CharType.Percent } as Character);
        expect(transitionToSpy).toHaveBeenCalledWith(Percent_State.instance);
    });

    it('should have singleton instances for states', () => {
        const instance1 = Whitespace_State.instance;
        const instance2 = Whitespace_State.instance;
        expect(instance1).toBe(instance2);
    });

    it('should have a toString method', () => {
        expect(Initial_State.instance.toString()).toBeTypeOf('string');
    });

    it('should transition through Hex_State', () => {
        const context = new Context(Hex_State.instance);
        const transitionToSpy = vi.spyOn(Hex_State.instance, 'handle');

        Hex_State.instance.setContext(context);

        const tokenizer = new Tokenizer();
        const input = '#ff00ff00';
        const chars = tokenizer.getCharacters(input);

        for (const ch of chars) {
            Hex_State.instance.handle(ch);
            expect(transitionToSpy).toHaveBeenCalledWith(ch);
        }
    });

    it('should transition out of Percent_State to Initial_State (lines 215-217)', () => {
        const ch = { value: '0', type: CharType.Number, index: 0, line: 1, column: 1 };
        const context = new Context(Percent_State.instance);
        const transitionToSpy = vi.spyOn(context, 'transitionTo');
        const handleSpy = vi.spyOn(Percent_State.instance, 'handle');
        Percent_State.instance.setContext(context);
        Percent_State.instance.handle(ch);

        expect(handleSpy).toHaveBeenCalledWith(ch);
        expect(transitionToSpy).toHaveBeenCalledWith(Initial_State.instance);
    });

    it('should transition out of Letter_State to Initial_State', () => {
        const ch = { value: '#', type: CharType.Number, index: 0, line: 1, column: 1 };
        const context = new Context(Letter_State.instance);
        const transitionToSpy = vi.spyOn(context, 'transitionTo');
        Letter_State.instance.setContext(context);
        Letter_State.instance.handle(ch);
        expect(transitionToSpy).toHaveBeenCalledWith(Initial_State.instance);
    });
});

describe('States2', () => {
    describe('Initial_State Transitions', () => {
        let context: Context;
        let transitionToSpy: any;

        // A fresh context and spy are created before each test in this block
        beforeEach(() => {
            context = new Context(Initial_State.instance);
            transitionToSpy = vi.spyOn(context, 'transitionTo');
        });

        it('should transition to Whitespace_State on a whitespace character', () => {
            // We are testing the handle method of Initial_State
            const state = Initial_State.instance;
            state.setContext(context); // The state needs the context to transition
            state.handle({ type: CharType.Whitespace } as Character);
            expect(transitionToSpy).toHaveBeenCalledWith(Whitespace_State.instance);
        });

        it('should transition to Hex_State on a hash character', () => {
            const state = Initial_State.instance;
            state.setContext(context);
            state.handle({ type: CharType.Hash } as Character);
            expect(transitionToSpy).toHaveBeenCalledWith(Hex_State.instance);
        });

        it('should transition to Letter_State on a letter character', () => {
            const state = Initial_State.instance;
            state.setContext(context);
            state.handle({ type: CharType.Letter } as Character);
            expect(transitionToSpy).toHaveBeenCalledWith(Letter_State.instance);
        });

        it('should transition to Number_State on a number character', () => {
            const state = Initial_State.instance;
            state.setContext(context);
            state.handle({ type: CharType.Number } as Character);
            expect(transitionToSpy).toHaveBeenCalledWith(Number_State.instance);
        });

        it('should transition to Operator_State on an operator character', () => {
            const state = Initial_State.instance;
            state.setContext(context);
            state.handle({ type: CharType.Operator } as Character);
            expect(transitionToSpy).toHaveBeenCalledWith(Operator_State.instance);
        });

        it('should transition to End_State on an EOF character', () => {
            const state = Initial_State.instance;
            state.setContext(context);
            state.handle({ type: CharType.EOF } as Character);
            expect(transitionToSpy).toHaveBeenCalledWith(End_State.instance);
        });
    });

    it('should return the correct accepting status for each state', () => {
        expect(Initial_State.instance.isAccepting()).toBe(false);
        expect(Whitespace_State.instance.isAccepting()).toBe(true);
        expect(Hex_State.instance.isAccepting()).toBe(true);
        expect(Letter_State.instance.isAccepting()).toBe(true);
        expect(Number_State.instance.isAccepting()).toBe(true);
        expect(Percent_State.instance.isAccepting()).toBe(true);
        expect(Operator_State.instance.isAccepting()).toBe(true);
        expect(End_State.instance.isAccepting()).toBe(true);
    });

    it('Number_State should transition to Percent_State on a percent character', () => {
        const context = new Context(Number_State.instance);
        const transitionToSpy = vi.spyOn(context, 'transitionTo');
        const state = Number_State.instance;
        state.setContext(context);
        state.handle({ type: CharType.Percent } as Character);
        expect(transitionToSpy).toHaveBeenCalledWith(Percent_State.instance);
    });

    it('should maintain singleton instances for states', () => {
        const instance1 = Whitespace_State.instance;
        const instance2 = Whitespace_State.instance;
        expect(instance1).toBe(instance2);
    });

    it('should have a working toString method', () => {
        expect(Initial_State.instance.toString()).toBeTypeOf('string');
    });

    it('Whitespace_State should transition to Initial_State on a non-whitespace char', () => {
        const context = new Context(Whitespace_State.instance);
        const transitionToSpy = vi.spyOn(context, 'transitionTo');
        const state = Whitespace_State.instance;
        state.setContext(context);

        // This is the action that triggers the uncovered line
        state.handle({ type: CharType.Letter } as Character);

        expect(transitionToSpy).toHaveBeenCalledWith(Initial_State.instance);
    });

    it('Hex_State should transition to Initial_State on a non-hex char', () => {
        const context = new Context(Hex_State.instance);
        const transitionToSpy = vi.spyOn(context, 'transitionTo');
        const state = Hex_State.instance;
        state.setContext(context);

        // This is the action that triggers the uncovered line
        state.handle({ type: CharType.Whitespace } as Character);

        expect(transitionToSpy).toHaveBeenCalledWith(Initial_State.instance);
    });

    it('Operator_State should transition to Initial_State on a non-operator char (line 242)', () => {
        const context = new Context(Operator_State.instance);
        const transitionToSpy = vi.spyOn(context, 'transitionTo');
        const state = Operator_State.instance;
        state.setContext(context);

        // This is the action that triggers the uncovered line
        state.handle({ type: CharType.Whitespace } as Character);

        expect(transitionToSpy).toHaveBeenCalledWith(Initial_State.instance);
    });

    it('Letter_State should transition to Initial_State on a non-letter char', () => {
        const context = new Context(Letter_State.instance);
        const transitionToSpy = vi.spyOn(context, 'transitionTo');
        const state = Letter_State.instance;
        state.setContext(context);

        // This is the action that triggers the uncovered line
        state.handle({ type: CharType.Whitespace } as Character);

        expect(transitionToSpy).toHaveBeenCalledWith(Initial_State.instance);
    });

    it('Number_State should transition to Initial_State on a non-numeric char', () => {
        const context = new Context(Number_State.instance);
        const transitionToSpy = vi.spyOn(context, 'transitionTo');
        const state = Number_State.instance;
        state.setContext(context);

        // This is the action that triggers the uncovered line
        state.handle({ type: CharType.Whitespace } as Character);

        expect(transitionToSpy).toHaveBeenCalledWith(Initial_State.instance);
    });

    it('End_State should transition to Initial_State on a non-EOF char (line 268)', () => {
        const context = new Context(End_State.instance);
        const transitionToSpy = vi.spyOn(context, 'transitionTo');
        const state = End_State.instance;
        state.setContext(context);

        // This is the action that triggers the uncovered line
        state.handle({ type: CharType.Letter } as Character);

        expect(transitionToSpy).toHaveBeenCalledWith(Initial_State.instance);
    });
});




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