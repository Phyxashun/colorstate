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
