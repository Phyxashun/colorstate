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