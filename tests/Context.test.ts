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
