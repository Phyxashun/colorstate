// src/FunctionalStates.ts

import { inspect, type InspectOptions } from 'node:util';
import { type Character, CharType } from './Character.ts';
import { CharacterStream } from './Character.ts';
import { Tokenizer } from './Tokenizer.ts';
import { Parser } from './Parser.ts';

export type Transition =
    | { kind: 'Stay' }
    | { kind: 'To'; state: StateName }
    | { kind: 'EmitAndTo'; state: StateName }
    | { kind: 'ToContinue'; state: StateName }
    | { kind: 'BeginString'; state: StateName; quoteType: CharType }
    | { kind: 'EndString'; state: StateName; quoteType: CharType }
    | { kind: 'EscapeNext'; state: StateName };

type TransitionFn =
    & { Stay: () => Transition; }
    & { To: (state: StateName) => Transition; }
    & { EmitAndTo: (state: StateName) => Transition; }
    & { ToContinue: (state: StateName) => Transition; }
    & { BeginString: (state: StateName, quoteType: CharType) => Transition; }
    & { EndString: (state: StateName, quoteType: CharType) => Transition; }
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

    BeginString: (state: StateName, quoteType: CharType): Transition =>
        ({ kind: 'BeginString', state, quoteType }),

    EndString: (state: StateName, quoteType: CharType): Transition =>
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
            case CharType.SingleQuote:
                return Transition.BeginString(State.String, CharType.SingleQuote);
            case CharType.DoubleQuote:
                return Transition.BeginString(State.String, CharType.DoubleQuote);
            case CharType.Backtick:
                return Transition.BeginString(State.String, CharType.Backtick);
            case CharType.Whitespace:
                return Transition.To(State.Whitespace);
            case CharType.NewLine:
                return Transition.To(State.NewLine);
            case CharType.Letter:
                return Transition.To(State.Letter);
            case CharType.Number:
                return Transition.To(State.Number);
            case CharType.Hash:
                return Transition.To(State.Hex);

            case CharType.Comma: case CharType.LParen: case CharType.RParen:
            case CharType.Plus: case CharType.Minus: case CharType.Star:
            case CharType.Slash: case CharType.Percent:
                return Transition.To(State.SingleChar);

            case CharType.EOF:
                return Transition.To(State.End);
            default:
                return Transition.To(State.SingleChar);
        }
    },

    [State.Whitespace]: (char) =>
        char.type === CharType.Whitespace
            ? Transition.Stay()
            : Transition.EmitAndTo(State.Initial),

    [State.NewLine]: (_) => Transition.EmitAndTo(State.Initial),

    [State.Letter]: (char) =>
        char.type === CharType.Letter
            ? Transition.Stay()
            : Transition.EmitAndTo(State.Initial),

    [State.Number]: (char) => {
        if (char.type === CharType.Number || char.type === CharType.Dot)
            return Transition.Stay();
        
        if (char.type === CharType.Percent)
            return Transition.ToContinue(State.Percent);

        if (char.type === CharType.Letter)
            return Transition.ToContinue(State.Dimension);

        return Transition.EmitAndTo(State.Initial);
    },

    [State.Dimension]: (char) =>
        char.type === CharType.Letter
            ? Transition.Stay()
            : Transition.EmitAndTo(State.Initial),

    [State.Hex]: (char) => {
        const isHex =
            char.type === CharType.Hash ||
            char.type === CharType.Letter ||
            char.type === CharType.Number;
        return isHex ? Transition.Stay() : Transition.EmitAndTo(State.Initial);
    },

    [State.String]: (char) => {
        if (char.type === CharType.BackSlash)
            return Transition.EscapeNext(State.String);
        if (
            char.type === CharType.SingleQuote ||
            char.type === CharType.DoubleQuote ||
            char.type === CharType.Backtick
        ) {
            return Transition.EndString(State.Initial, char.type);
        }

        if (char.type === CharType.EOF || char.type === CharType.NewLine)
            return Transition.EmitAndTo(State.Initial);
        return Transition.Stay();
    },

    [State.Percent]: (_) => Transition.EmitAndTo(State.Initial),

    [State.SingleChar]: (_) => Transition.EmitAndTo(State.Initial),

    [State.Symbol]: (char) => {
        const isSym = [
            CharType.Unicode,
            CharType.BackSlash,
            CharType.At,
            CharType.Symbol
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
    console.log('=== CHARACTERSTREAM DEMO ===\n');
    line();

    const input = 'rgba(255, 100, 75, 50%)';

    const stream = new CharacterStream(input);
    let currentState: StateName = State.Initial;
    
    console.log(`INPUT: '${input}'\n`);
    console.log('RESULT OF CHARACTERSTREAM:\n');
    
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

        // Step 1: Tokenize
        const tokenizer = new Tokenizer();
        const tokens = tokenizer
            .withLogging(`PARSER TEST:\n\nINPUT:\t'${input}'\n\n${'─'.repeat(80)}`)
            .tokenize(input);

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