// index.ts

import { inspect, type InspectOptions } from 'node:util';
import { Context } from './src/Context.ts';
import { CharacterStream } from "./src/CharacterStream.ts";
import { Character, CharType } from './src/Character.ts';
import { InitialState } from './src/States.ts';

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

const test1 = () => {
    console.log()
    console.log('TEST (1):');

    const input: string = '67 a b c 1 word 2 3+2-0';
    const stream: CharacterStream = new CharacterStream(input);
    const dfa: Context = new Context(InitialState);
    let result: Character[] = [];

    console.log(`\nSOURCE:\t${input}\n`);

    for (const char of stream) {
        const emitted = dfa.processTokens(char);
        if (emitted) result.push(emitted);
        if (char.type === CharType.EOF) break;
    }

    console.log(`\n\nRESULT OF TEST (1):\n`);

    for (const char of result) {
        console.log(`\t`, inspect(char, inspectOptions));
    }
}

const test2 = () => {
    console.log()
    console.log('TEST (1):');

    const input: string = '67 a b c 1 word 2 3+2-0';
    const stream: CharacterStream = new CharacterStream(input);
    const dfa: Context = new Context(InitialState);
    let result: Character[] = [];

    console.log(`\nSOURCE:\t${input}\n`);

    for (const char of stream) {
        const emitted = dfa.processCharacters(char);
        if (emitted) result.push(emitted);
        if (char.type === CharType.EOF) break;
    }

    console.log(`\n\nRESULT OF TEST (1):\n`);

    for (const char of result) {
        console.log(`\t`, inspect(char, inspectOptions));
    }
}

test1();
test2();




// src/Token.ts

interface Token {
    type: TokenType;
    value: string;
}


export enum TokenType {
    // String and Numeric Literals
    IDENTIFIER = 'IDENTIFIER',  // words
    STRING = 'STRING',          // string literals
    HEXVALUE = 'HEXVALUE',      // hexadecimal values
    NUMBER = 'NUMBER',          // numeric literals
    PERCENT = 'PERCENT',        // numeric literals followed by '%'
    DIMENSION = 'DIMENSION',    // numeric literals followed by units
    UNICODE = 'UNICODE',        // unicode characters

    // Operator Tokens
    PLUS = 'PLUS',              // '+'
    MINUS = 'MINUS',            // '-'

    // Delimiter Tokens
    COMMA = 'COMMA',            // ','
    SLASH = 'SLASH',            // '/'
    LPAREN = 'LPAREN',          // '('
    RPAREN = 'RPAREN',          // ')'
    DELIMITER = 'DELIMITER',    // all other delimiters, punctuators
    OPERATOR = 'OPERATOR',

    // Possibly ignored Tokens
    WHITESPACE = 'WHITESPACE',  // all whitespace
    EOF = '<end>',              // end of file/line
    ERROR = '<error>',          // token error
};





// src/Character.ts

export type ClassifyFunction = (char: string) => CharType;
export type CharTypeFn = (char: string) => boolean;
export type Spec = Map<CharType, CharTypeFn>;

export enum CharType {
    Start = 'Start',
    Whitespace = 'Whitespace',
    EOF = 'EOF',
    Digit = 'Digit', // 0-9
    Letter = 'Letter',
    Operator = 'Operator', // All others
    Other = 'Other',
};

const OPERATORS = new Set([
    '%', '.', ',', '/', '(', ')', '+', '-', '_', '#', '!',
    '\\', '*', '@', '$', '^', '&', '{', '}', '[', ']', '|',
    ':', ';', '<', '>', '?', '~', '`', '"', "'", '='
]);

export const CharSpec: Spec = new Map<CharType, CharTypeFn>([
    [CharType.EOF, (char) => char === 'EOF'],
    [CharType.Whitespace, (char) => char === ' ' || char === '\t' || char === '\n' || char === '\r'],
    [CharType.Letter, (char) => /\p{L}/u.test(char)],
    [CharType.Digit, (char) => /\d/.test(char)],
    [CharType.Operator, (char) => OPERATORS.has(char)],
]);

export class Character {
    value: string = '';
    type: CharType = CharType.Start;
    index: number = 0;
    line: number = 1;
    column: number = 1;

    public static classify: ClassifyFunction = (char: string): CharType => {
        if (char) {
            for (const [charType, fn] of CharSpec) {
                if (fn(char)) return charType as CharType;
            }
        }
        return CharType.Other;
    };
}






// src/CharacterStream.ts

import { Character, CharType } from "./Character";

export class CharacterStream implements IterableIterator<Character> {
    private input: string = '';
    private index = 0;
    private line = 1;
    private column = 1;
    private eofEmitted = false;

    constructor(input: string) {
        this.input = input.normalize('NFC');
    }

    public next(): IteratorResult<Character> {
        if (this.isEOF()) {
            if (this.eofEmitted) {
                return { done: true, value: undefined as any };
            }
            this.eofEmitted = true;
            return { done: false, value: this.atEOF() };  // ✅ Return EOF with done:false
        }

        const codePoint = this.input.codePointAt(this.index) as number;
        const char = String.fromCodePoint(codePoint);

        const result = {
            value: char,
            type: Character.classify(char),
            index: this.index,
            line: this.line,
            column: this.column
        };

        this.advance(char);
        return { done: false, value: result };
    }

    [Symbol.iterator](): IterableIterator<Character> {
        return this;
    }

    public advance(char: string): void {
        this.index += char.length;

        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
    }

    public peek(): string | null {
        const cp = this.input.codePointAt(this.index);
        return cp !== undefined ? String.fromCodePoint(cp) : null;
    }

    public isEOF(): boolean {
        return this.index >= this.input.length;
    }

    public atEOF(): Character {
        return {
            value: 'EOF',
            type: CharType.EOF,
            index: this.index,
            line: this.line,
            column: this.column
        };
    }

    public atError(): Character {
        return {
            value: 'Error',
            type: CharType.Other,
            index: this.index,
            line: this.line,
            column: this.column
        };
    }
}




// src/Context.ts

import { CharType, type Character } from "./Character";
import { State } from "./State";

export class Context {
    private state: State;
    public previousChar: Character | null = null;
    public buffer: Character[] = [];

    constructor(initialState: State) {
        this.state = initialState;
        this.state.setContext(this);
    }

    public transitionTo(state: State): void {
        this.state = state;
        this.state.setContext(this);
    }

    public processTokens(char: Character): Character | null {
        const wasAccepting = this.state.isAccepting();
        const previousState = this.state;

        if (char.type === CharType.EOF) {
            if (wasAccepting && this.buffer.length > 0) {
                const token = this.createToken(this.buffer);
                this.buffer = [];
                this.state.handle(char);
                this.previousChar = char;
                return token;
            }
            this.state.handle(char);
            this.previousChar = char;
            return null;
        }

        this.previousChar = char;
        this.state.handle(char);

        const isAccepting = this.state.isAccepting();
        const changedState = (this.state !== previousState);

        if (changedState && wasAccepting && !isAccepting) {
            let tokenToEmit = null;
            if (this.buffer.length > 0) {
                tokenToEmit = this.createToken(this.buffer);
                this.buffer = [];
            }

            this.state.handle(char);
            const newAccepting = this.state.isAccepting();

            if (newAccepting) {
                this.buffer.push(char);
            }

            return tokenToEmit;
        }

        if (isAccepting) {
            this.buffer.push(char);
        }

        return null;
    }

    public processCharacters(char: Character): Character | null {
        if (char.type === CharType.EOF) {
            this.state.handle(char);
            this.previousChar = char;
            return null;
        }

        const wasAccepting = this.state.isAccepting();
        const previousState = this.state;

        this.previousChar = char;
        this.state.handle(char);

        const isAccepting = this.state.isAccepting();
        const changedState = (this.state !== previousState);

        if (wasAccepting && changedState && !isAccepting) {
            this.state.handle(char);

            if (this.state.isAccepting()) {
                return char;
            }

            return this.previousChar;
        }

        if (isAccepting) {
            return char;
        }

        return null;
    }

    private createToken(chars: Character[]): Character {
        if (chars.length === 0) throw new Error('Cannot create token from empty buffer');

        let value = '';
        for (let i = 0; i < chars.length; i++) {
            value += chars[i]!.value;
        }

        return {
            value,
            type: chars[0]!.type,
            index: chars[0]!.index,
            line: chars[0]!.line,
            column: chars[0]!.column
        };
    }

    public isAccepted(): boolean {
        return this.state.isAccepting();
    }
}





// src/State.ts

import { inspect, type InspectOptions } from 'node:util';
import { Context } from './Context';
import type { Character } from './Character';

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

export abstract class State {
    protected context!: Context;

    public setContext(context: Context) {
        this.context = context;
    }

    public toString(): string {
        return `\n\t${inspect(this, inspectOptions)} \n`;
    }

    public abstract handle(char: Character): void;
    public abstract isAccepting(): boolean;
}





// src/States.ts

import { State } from './State.ts';
import { Character, CharType } from './Character';

class Initial_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Initial_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        switch (char.type) {
            case CharType.Whitespace:
                this.context.transitionTo(WhiteSpace_State.instance);
                break;
            case CharType.EOF:
                this.context.transitionTo(End_State.instance);
                break;
            case CharType.Operator:
                this.context.transitionTo(Operator_State.instance);
                break;
            case CharType.Letter:
                this.context.transitionTo(Letter_State.instance);
                break;
            case CharType.Digit:
                this.context.transitionTo(Number_State.instance);
                break;
            default:
                this.context.transitionTo(Initial_State.instance);
                break;
        }
    }

    public isAccepting(): boolean {
        return false;
    }
}

class WhiteSpace_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new WhiteSpace_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        if (char.type !== CharType.Whitespace) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    public isAccepting(): boolean {
        return true;
    }
}

class Letter_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Letter_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        if (char.type !== CharType.Letter) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    public isAccepting(): boolean {
        return true;
    }
}

class Number_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Number_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        if (char.type !== CharType.Digit) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    public isAccepting(): boolean {
        return true;
    }
}

class Operator_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new Operator_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        if (char.type !== CharType.Operator) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    public isAccepting(): boolean {
        return true;
    }
}

class End_State extends State {
    static #instance: State;

    private constructor() {
        super();
    }

    public static get instance(): State {
        if (!this.#instance) {
            this.#instance = new End_State();
        }
        return this.#instance;
    }

    public handle(char: Character): void {
        if (char.type !== CharType.EOF) {
            this.context.transitionTo(Initial_State.instance);
        }
    }

    public isAccepting(): boolean {
        return true;
    }
}

const InitialState = Initial_State.instance;
const WhiteSpaceState = WhiteSpace_State.instance;
const LetterState = Letter_State.instance;
const NumberState = Number_State.instance;
const OperatorState = Operator_State.instance;
const EndState = End_State.instance;

export {
    InitialState,
    WhiteSpaceState,
    LetterState,
    NumberState,
    OperatorState,
    EndState
}





CURRENT OUTPUT:

bun run./ index.ts

TEST(1):

SOURCE: 67 a b c 1 word 2 3 + 2 - 0



RESULT OF TEST(1):

{ value: '67', type: 'Digit', index: 0, line: 1, column: 1 }
{ value: ' ', type: 'Whitespace', index: 2, line: 1, column: 3 }
{ value: 'a', type: 'Letter', index: 3, line: 1, column: 4 }
{ value: ' ', type: 'Whitespace', index: 4, line: 1, column: 5 }
{ value: 'b', type: 'Letter', index: 5, line: 1, column: 6 }
{ value: ' ', type: 'Whitespace', index: 6, line: 1, column: 7 }
{ value: 'c', type: 'Letter', index: 7, line: 1, column: 8 }
{ value: ' ', type: 'Whitespace', index: 8, line: 1, column: 9 }
{ value: '1', type: 'Digit', index: 9, line: 1, column: 10 }
{ value: ' ', type: 'Whitespace', index: 10, line: 1, column: 11 }
{ value: 'word', type: 'Letter', index: 11, line: 1, column: 12 }
{ value: ' ', type: 'Whitespace', index: 15, line: 1, column: 16 }
{ value: '2', type: 'Digit', index: 16, line: 1, column: 17 }
{ value: ' ', type: 'Whitespace', index: 17, line: 1, column: 18 }
{ value: '3', type: 'Digit', index: 18, line: 1, column: 19 }
{ value: '+', type: 'Operator', index: 19, line: 1, column: 20 }
{ value: '2', type: 'Digit', index: 20, line: 1, column: 21 }
{ value: '-', type: 'Operator', index: 21, line: 1, column: 22 }
{ value: '0', type: 'Digit', index: 22, line: 1, column: 23 }

TEST(1):

SOURCE: 67 a b c 1 word 2 3 + 2 - 0



RESULT OF TEST(1):

{ value: '6', type: 'Digit', index: 0, line: 1, column: 1 }
{ value: '7', type: 'Digit', index: 1, line: 1, column: 2 }
{ value: ' ', type: 'Whitespace', index: 2, line: 1, column: 3 }
{ value: 'a', type: 'Letter', index: 3, line: 1, column: 4 }
{ value: ' ', type: 'Whitespace', index: 4, line: 1, column: 5 }
{ value: 'b', type: 'Letter', index: 5, line: 1, column: 6 }
{ value: ' ', type: 'Whitespace', index: 6, line: 1, column: 7 }
{ value: 'c', type: 'Letter', index: 7, line: 1, column: 8 }
{ value: ' ', type: 'Whitespace', index: 8, line: 1, column: 9 }
{ value: '1', type: 'Digit', index: 9, line: 1, column: 10 }
{ value: ' ', type: 'Whitespace', index: 10, line: 1, column: 11 }
{ value: 'w', type: 'Letter', index: 11, line: 1, column: 12 }
{ value: 'o', type: 'Letter', index: 12, line: 1, column: 13 }
{ value: 'r', type: 'Letter', index: 13, line: 1, column: 14 }
{ value: 'd', type: 'Letter', index: 14, line: 1, column: 15 }
{ value: ' ', type: 'Whitespace', index: 15, line: 1, column: 16 }
{ value: '2', type: 'Digit', index: 16, line: 1, column: 17 }
{ value: ' ', type: 'Whitespace', index: 17, line: 1, column: 18 }
{ value: '3', type: 'Digit', index: 18, line: 1, column: 19 }
{ value: '+', type: 'Operator', index: 19, line: 1, column: 20 }
{ value: '2', type: 'Digit', index: 20, line: 1, column: 21 }
{ value: '-', type: 'Operator', index: 21, line: 1, column: 22 }
{ value: '0', type: 'Digit', index: 22, line: 1, column: 23 }