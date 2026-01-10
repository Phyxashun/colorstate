

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old/Parser.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




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





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old/Parser.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old/FunctionalStates.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/FunctionalStates.ts

import { inspect, type InspectOptions } from 'node:util';
import Char, { type Character } from '../src/Character.ts';
import { Tokenizer } from '../src/Tokenizer.ts';
import { Parser } from './Parser.ts';

export type Transition =
    | { kind: 'Stay' }
    | { kind: 'To'; state: StateName }
    | { kind: 'EmitAndTo'; state: StateName }
    | { kind: 'ToContinue'; state: StateName }
    | { kind: 'BeginString'; state: StateName; quoteType: Char.Type }
    | { kind: 'EndString'; state: StateName; quoteType: Char.Type }
    | { kind: 'EscapeNext'; state: StateName };

type TransitionFn =
    & { Stay: () => Transition; }
    & { To: (state: StateName) => Transition; }
    & { EmitAndTo: (state: StateName) => Transition; }
    & { ToContinue: (state: StateName) => Transition; }
    & { BeginString: (state: StateName, quoteType: Char.Type) => Transition; }
    & { EndString: (state: StateName, quoteType: Char.Type) => Transition; }
    & { EscapeNext: (state: StateName) => Transition; };

export const Transition: TransitionFn = {
    Stay: (): Transition =>
        ({ kind: 'Stay' }),

    To: (state: StateName): Transition =>
        ({ kind: 'To', state }),

    EmitAndTo: (state: StateName): Transition =>
        ({ kind: 'EmitAndTo', state }),

    ToContinue: (state: StateName): Transition =>
        ({ kind: 'ToContinue', state }),

    BeginString: (state: StateName, quoteType: Char.Type): Transition =>
        ({ kind: 'BeginString', state, quoteType }),

    EndString: (state: StateName, quoteType: Char.Type): Transition =>
        ({ kind: 'EndString', state, quoteType }),

    EscapeNext: (state: StateName): Transition =>
        ({ kind: 'EscapeNext', state }),
}

// Define the available state names as a type for safety
export type StateName =
    | 'Initial' | 'Whitespace' | 'NewLine' | 'Letter'
    | 'Number' | 'Dimension' | 'Hex' | 'String'
    | 'Percent' | 'SingleChar' | 'Symbol' | 'End';

enum State {
    Initial = 'Initial',
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',
    Letter = 'Letter',
    Number = 'Number',
    Dimension = 'Dimension',
    Hex = 'Hex',
    String = 'String',
    Percent = 'Percent',
    SingleChar = 'SingleChar',
    Symbol = 'Symbol',
    End = 'End',
}

// Define the functional state handler type
type StateHandler = (char: Character) => Transition;

export const FunctionalStates: Record<StateName, StateHandler> = {
    [State.Initial]: (char) => {
        switch (char.type) {
            case Char.Type.SingleQuote:
                return Transition.BeginString(State.String, Char.Type.SingleQuote);
            case Char.Type.DoubleQuote:
                return Transition.BeginString(State.String, Char.Type.DoubleQuote);
            case Char.Type.Backtick:
                return Transition.BeginString(State.String, Char.Type.Backtick);
            case Char.Type.Whitespace:
                return Transition.To(State.Whitespace);
            case Char.Type.NewLine:
                return Transition.To(State.NewLine);
            case Char.Type.Letter:
                return Transition.To(State.Letter);
            case Char.Type.Number:
                return Transition.To(State.Number);
            case Char.Type.Hash:
                return Transition.To(State.Hex);

            case Char.Type.Comma: case Char.Type.LParen: case Char.Type.RParen:
            case Char.Type.Plus: case Char.Type.Minus: case Char.Type.Star:
            case Char.Type.Slash: case Char.Type.Percent:
                return Transition.To(State.SingleChar);

            case Char.Type.EOF:
                return Transition.To(State.End);
            default:
                return Transition.To(State.SingleChar);
        }
    },

    [State.Whitespace]: (char) =>
        char.type === Char.Type.Whitespace
            ? Transition.Stay()
            : Transition.EmitAndTo(State.Initial),

    [State.NewLine]: (_) => Transition.EmitAndTo(State.Initial),

    [State.Letter]: (char) =>
        char.type === Char.Type.Letter
            ? Transition.Stay()
            : Transition.EmitAndTo(State.Initial),

    [State.Number]: (char) => {
        if (char.type === Char.Type.Number || char.type === Char.Type.Dot)
            return Transition.Stay();
        
        if (char.type === Char.Type.Percent)
            return Transition.ToContinue(State.Percent);

        if (char.type === Char.Type.Letter)
            return Transition.ToContinue(State.Dimension);

        return Transition.EmitAndTo(State.Initial);
    },

    [State.Dimension]: (char) =>
        char.type === Char.Type.Letter
            ? Transition.Stay()
            : Transition.EmitAndTo(State.Initial),

    [State.Hex]: (char) => {
        const isHex =
            char.type === Char.Type.Hash ||
            char.type === Char.Type.Letter ||
            char.type === Char.Type.Number;
        return isHex ? Transition.Stay() : Transition.EmitAndTo(State.Initial);
    },

    [State.String]: (char) => {
        if (char.type === Char.Type.BackSlash)
            return Transition.EscapeNext(State.String);
        if (
            char.type === Char.Type.SingleQuote ||
            char.type === Char.Type.DoubleQuote ||
            char.type === Char.Type.Backtick
        ) {
            return Transition.EndString(State.Initial, char.type);
        }

        if (char.type === Char.Type.EOF || char.type === Char.Type.NewLine)
            return Transition.EmitAndTo(State.Initial);
        return Transition.Stay();
    },

    [State.Percent]: (_) => Transition.EmitAndTo(State.Initial),

    [State.SingleChar]: (_) => Transition.EmitAndTo(State.Initial),

    [State.Symbol]: (char) => {
        const isSym = [
            Char.Type.Unicode,
            Char.Type.BackSlash,
            Char.Type.At,
            Char.Type.Symbol
        ].includes(char.type);
        return isSym ? Transition.Stay() : Transition.EmitAndTo(State.Initial);
    },

    [State.End]: (_) => Transition.Stay(),
}

// Define which states are "Accepting" (can produce a token)
export const AcceptingStates = new Set<StateName>([
    State.Whitespace,
    State.NewLine,
    State.Letter,
    State.Number,
    State.Dimension,
    State.Hex,
    State.String,
    State.Percent,
    State.SingleChar,
    State.Symbol,
    State.End
]);

// TESTING
const compactInspectOptions: InspectOptions = {
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

const inspectOptions: InspectOptions = {
    showHidden: true,
    depth: null,
    colors: true,
    customInspect: false,
    showProxy: false,
    maxArrayLength: null,
    maxStringLength: null,
    breakLength: 100,
    compact: false,
    sorted: false,
    getters: false,
    numericSeparator: true,
};

const line = (newLine: boolean = true, width: number = 80): void => {
    if (newLine) console.log(`${'─'.repeat(width)}\n`);
    if (!newLine) console.log(`${'─'.repeat(width)}`);
}

const characterStreamTest = () => {
    line();
    console.log('=== Char.Stream DEMO ===\n');
    line();

    const input = 'rgba(255, 100, 75, 50%)';

    const stream = new Char.Stream(input);
    let currentState: StateName = State.Initial;
    
    console.log(`INPUT: '${input}'\n`);
    console.log('RESULT OF Char.Stream:\n');
    
    for (const char of stream) {
        const ch = { value: char.value, type: char.type };
        const wasAccepting = AcceptingStates.has(currentState);
        const transition = FunctionalStates[currentState](char);
        console.log(inspect(ch, compactInspectOptions));
        console.log('WAS ACCEPTING:', wasAccepting, inspect(transition, compactInspectOptions));
        console.log();
        if ('state' in transition) {
            currentState = transition.state;
        }
    }
    
    line();
    console.log('NEW TEST\n')
    line();

    stream.set(input);

    // Step 1: Tokenize
    const tokenizer = new Tokenizer();
    const tokens = tokenizer
        .withLogging(`PARSER TEST:\n\nINPUT:\t'${input}'\n\n${'─'.repeat(80)}`)
        .tokenize(stream);

    // Step 2: Parse
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // Step 3: Console log the AST
    console.log('\nAST:\n');
    const defaultAST = inspect(ast, inspectOptions);
    const fourSpaceAST = defaultAST.replace(/^ +/gm, match => ' '.repeat(match.length * 2));
    console.log(fourSpaceAST, '\n');
    line();
}

characterStreamTest();




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old/FunctionalStates.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old/States.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




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





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old/States.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old/Context.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




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





//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old/Context.test.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old/States.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import Char, { type Character } from '../src/Character.ts';
import { Transition } from './Transition';

abstract class State {
    public abstract isAccepting: boolean;

    protected inspectOptions: InspectOptions = {
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

    public toString(): string {
        return `\t${inspect(this, this.inspectOptions)}`;
    }

    public abstract handle(char: Character): Transition;
}

class Initial_State extends State {
    public isAccepting: boolean = false;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Initial_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            // String delimiters
            case Char.Type.SingleQuote:
                return Transition.BeginString(String_State.instance, Char.Type.SingleQuote);
            case Char.Type.DoubleQuote:
                return Transition.BeginString(String_State.instance, Char.Type.DoubleQuote);
            case Char.Type.Backtick:
                return Transition.BeginString(String_State.instance, Char.Type.Backtick);

            // Whitespace
            case Char.Type.Whitespace:
                return Transition.To(Whitespace_State.instance);
            case Char.Type.NewLine:
                return Transition.To(NewLine_State.instance);

            // Letters
            case Char.Type.Letter:
                return Transition.To(Letter_State.instance);

            // Numbers
            case Char.Type.Number:
                return Transition.To(Number_State.instance);

            // Hexadecimal
            case Char.Type.Hash:
                return Transition.To(Hex_State.instance);

            // All single-character tokens
            case Char.Type.Comma:
            case Char.Type.LParen:
            case Char.Type.RParen:
            case Char.Type.LBracket:
            case Char.Type.RBracket:
            case Char.Type.LBrace:
            case Char.Type.RBrace:
            case Char.Type.SemiColon:
            case Char.Type.Dot:
            case Char.Type.Plus:
            case Char.Type.Minus:
            case Char.Type.Star:
            case Char.Type.Slash:
            case Char.Type.EqualSign:
            case Char.Type.GreaterThan:
            case Char.Type.LessThan:
            case Char.Type.Exclamation:
            case Char.Type.Question:
            case Char.Type.Colon:
            case Char.Type.Caret:
            case Char.Type.Ampersand:
            case Char.Type.Pipe:
            case Char.Type.Tilde:
            case Char.Type.At:
            case Char.Type.Dollar:
            case Char.Type.Underscore:
            case Char.Type.Symbol:
                return Transition.To(SingleChar_State.instance);

            case Char.Type.BackSlash:
            case Char.Type.Unicode:
                return Transition.To(Symbol_State.instance);

            case Char.Type.Other:
                return Transition.To(SingleChar_State.instance);

            case Char.Type.EOF:
                return Transition.To(End_State.instance);

            case Char.Type.Error:
                return Transition.To(End_State.instance);

            default:
                return Transition.Stay();
        }
    }
}

class Whitespace_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Whitespace_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Whitespace:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class NewLine_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new NewLine_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        return Transition.EmitAndTo(Initial_State.instance);
    }
}

class Letter_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Letter_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Letter:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class Number_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Number_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Number:
            case Char.Type.Dot:
                return Transition.Stay();

            case Char.Type.Percent:
                return Transition.ToContinue(Percent_State.instance);

            case Char.Type.Letter:
                return Transition.ToContinue(Dimension_State.instance);

            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class Dimension_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Dimension_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Letter:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class Hex_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Hex_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Hash:
            case Char.Type.Hex:
            case Char.Type.Letter:
            case Char.Type.Number:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class String_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new String_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.BackSlash:
                return Transition.EscapeNext(String_State.instance);

            case Char.Type.SingleQuote:
                return Transition.EndString(Initial_State.instance, Char.Type.SingleQuote);

            case Char.Type.DoubleQuote:
                return Transition.EndString(Initial_State.instance, Char.Type.DoubleQuote);

            case Char.Type.Backtick:
                return Transition.EndString(Initial_State.instance, Char.Type.Backtick);

            case Char.Type.EOF:
            case Char.Type.NewLine:
                return Transition.EmitAndTo(Initial_State.instance);

            default:
                return Transition.Stay();
        }
    }
}

class Percent_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Percent_State();
        }
        return this.#instance;
    }

    public handle(_: Character): Transition {
        return Transition.EmitAndTo(Initial_State.instance);
    }
}

class SingleChar_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new SingleChar_State();
        }
        return this.#instance;
    }

    public handle(_: Character): Transition {
        return Transition.EmitAndTo(Initial_State.instance);
    }
}

class Symbol_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Symbol_State();
        }
        return this.#instance;
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case Char.Type.Unicode:
            case Char.Type.BackSlash:
            case Char.Type.At:
            case Char.Type.Dollar:
            case Char.Type.Underscore:
            case Char.Type.Symbol:
                return Transition.Stay();
            default:
                return Transition.EmitAndTo(Initial_State.instance);
        }
    }
}

class End_State extends State {
    public isAccepting: boolean = true;

    private constructor() { super(); }

    static #instance: State;

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new End_State();
        }
        return this.#instance;
    }

    public handle(_: Character): Transition {
        return Transition.Stay();
    }
}

const InitialState = Initial_State.instance;
const WhitespaceState = Whitespace_State.instance;
const NewLineState = NewLine_State.instance;
const LetterState = Letter_State.instance;
const NumberState = Number_State.instance;
const DimensionState = Dimension_State.instance;
const HexState = Hex_State.instance;
const StringState = String_State.instance;
const PercentState = Percent_State.instance;
const SingleCharState = SingleChar_State.instance;
const SymbolState = Symbol_State.instance;
const EndState = End_State.instance;

export {
    InitialState,
    WhitespaceState,
    NewLineState,
    LetterState,
    NumberState,
    DimensionState,
    HexState,
    StringState,
    PercentState,
    SingleCharState,
    SymbolState,
    EndState,
    State,
}




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old/States.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Start of file: test_old/Transition.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■




// src/Transition.ts

import { State } from './States.ts';
import Char from './Character.ts';

export type Transition =
    | { kind: 'Stay' }
    | { kind: 'To'; state: State }
    | { kind: 'EmitAndTo'; state: State }
    | { kind: 'ToContinue'; state: State }
    | { kind: 'BeginString'; state: State; quoteType: Char.Type }
    | { kind: 'EndString'; state: State; quoteType: Char.Type }
    | { kind: 'EscapeNext'; state: State };

type TransitionFn =
    & { Stay: () => Transition; }
    & { To: (state: State) => Transition; }
    & { EmitAndTo: (state: State) => Transition; }
    & { ToContinue: (state: State) => Transition; }
    & { BeginString: (state: State, quoteType: Char.Type) => Transition; }
    & { EndString: (state: State, quoteType: Char.Type) => Transition; }
    & { EscapeNext: (state: State) => Transition; };

export const Transition: TransitionFn = {
    Stay: (): Transition => 
        ({ kind: 'Stay' }),

    To: (state: State): Transition => 
        ({ kind: 'To', state }),

    EmitAndTo: (state: State): Transition => 
        ({ kind: 'EmitAndTo', state }),

    ToContinue: (state: State): Transition => 
        ({ kind: 'ToContinue', state }),
    
    BeginString: (state: State, quoteType: Char.Type): Transition =>
        ({ kind: 'BeginString', state, quoteType }),

    EndString: (state: State, quoteType: Char.Type): Transition =>
        ({ kind: 'EndString', state, quoteType }),

    EscapeNext: (state: State): Transition =>
        ({ kind: 'EscapeNext', state }),
};




//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ End of file: test_old/Transition.ts ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//████████████████████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████
