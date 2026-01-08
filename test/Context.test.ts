// test/Context.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { Context } from '../src/Context.ts';
import { CharType, type Character } from '../src/Character.ts';
import { State, TokenType } from '../types/Types.ts';

describe('Context State Machine', () => {
    let ctx: Context;

    // Helper to create a mock Character
    const char = (value: string, type: CharType): Character => ({
        value,
        type,
        position: { index: 0, line: 1, column: 1 }
    });

    beforeEach(() => {
        ctx = new Context();
    });

    describe('Initial Transitions', () => {
        it('should transition from INITIAL to IN_IDENTIFIER on a letter', () => {
            const action = ctx.process(char('a', CharType.Letter));
            expect(ctx.state).toBe(State.IN_IDENTIFIER);
            expect(action.emit).toBe(false);
        });

        it('should transition to IN_STRING and store quoteType', () => {
            const action = ctx.process(char('"', CharType.DoubleQuote));
            expect(ctx.state).toBe(State.IN_STRING);
            expect(action.ignore).toBe(true); // Quotes are usually ignored in the buffer
        });
    });

    describe('Numeric Logic (Dimensions & Percentages)', () => {
        it('should handle dimensions: Number -> Letter', () => {
            ctx.process(char('1', CharType.Number));
            expect(ctx.state).toBe(State.IN_NUMBER);

            const action = ctx.process(char('d', CharType.Letter));
            expect(ctx.state).toBe(State.IN_DIMENSION);
            expect(action.emit).toBe(false); // Still building the dimension
        });

        it('should handle percentages: Number -> Percent', () => {
            ctx.process(char('5', CharType.Number));
            const action = ctx.process(char('%', CharType.Percent));
            expect(ctx.state).toBe(State.IN_PERCENT);
            expect(action.tokenType).toBe(TokenType.PERCENT);
        });
    });

    describe('Comment Logic', () => {
        it('should identify a single-line comment after seen slash', () => {
            ctx.process(char('/', CharType.Slash)); // SEEN_SLASH
            const action = ctx.process(char('/', CharType.Slash));
            expect(ctx.state).toBe(State.IN_SINGLE_LINE_COMMENT);
            expect(action.tokenType).toBe(TokenType.COMMENT);
        });

        it('should handle a slash followed by a space as a division operator', () => {
            ctx.process(char('/', CharType.Slash)); // SEEN_SLASH
            const action = ctx.process(char(' ', CharType.Whitespace));
            expect(ctx.state).toBe(State.INITIAL);
            expect(action.reprocess).toBe(true);
            expect(action.tokenType).toBe(TokenType.SLASH);
        });

        it('should correctly exit a multi-line comment', () => {
            ctx.state = State.IN_MULTI_LINE_COMMENT;
            ctx.process(char('*', CharType.Star));
            expect(ctx.state).toBe(State.IN_MULTI_LINE_COMMENT_SAW_STAR);

            const action = ctx.process(char('/', CharType.Slash));
            expect(ctx.state).toBe(State.INITIAL);
            expect(action.emit).toBe(true);
        });
    });

    describe('String Escaping', () => {
        it('should transition to IN_ESCAPE when seeing a backslash in a string', () => {
            ctx.state = State.IN_STRING;
            ctx.process(char('\\', CharType.BackSlash));
            expect(ctx.state).toBe(State.IN_ESCAPE);
        });

        it('should return to IN_STRING after processing an escaped character', () => {
            ctx.state = State.IN_ESCAPE;
            const action = ctx.process(char('n', CharType.Letter));
            expect(ctx.state).toBe(State.IN_STRING);
            expect(action.emit).toBe(false);
        });
    });

    describe('Edge Cases & Branch Coverage', () => {
        it('should reset to INITIAL and reprocess on unknown states', () => {
            // Force an invalid state manually
            (ctx as any)._state = "INVALID_STATE";
            const action = ctx.process(char('?', CharType.Other));
            expect(ctx.state).toBe(State.INITIAL);
            expect(action.reprocess).toBe(true);
        });

        it('should handle the EOF transition from a comment', () => {
            ctx.state = State.IN_SINGLE_LINE_COMMENT;
            const action = ctx.process(char('', CharType.EOF));
            expect(ctx.state).toBe(State.INITIAL);
            expect(action.emit).toBe(true);
        });
    });
});