// src/Context.ts

import { inspect, type InspectOptions } from 'node:util';
import { CharType, type Character } from "./Character.ts";
import { TokenType, type Token } from "./Tokenizer.ts";
import { State } from "./States.ts";

/**
 * Context manages the DFA (Deterministic Finite Automaton) state machine
 * Processes characters through state transitions and emits tokens
 */
class Context {
    private inspectOptions: InspectOptions = {
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
    private state: State;

    /** Buffer for accumulating characters into multi-character tokens */
    public buffer: Character[] = [];

    constructor(initialState: State) {
        this.state = initialState;
    }

    public transitionTo(state: State): void {
        this.state = state;
    }

    public processTokens(char: Character): [boolean, Token?] {
        const transition = this.state.handle(char);

        switch (transition.kind) {
            case "Stay": {
                if (this.state.isAccepting)
                    this.buffer.push(char);
                console.log(`1. Stay.\t${this.state.name}: ${inspect(char, this.inspectOptions)}`);
                return [false];
            }

            case "To": {
                this.transitionTo(transition.state);

                if (this.state.isAccepting)
                    this.buffer.push(char);
                console.log(`2. To.\t\t${this.state.name}: ${inspect(char, this.inspectOptions)}`);
                return [false];
            }

            case "EmitAndTo": {
                const token =
                    this.buffer.length > 0
                        ? this.createToken(this.buffer)
                        : undefined;
                this.buffer = [];
                this.transitionTo(transition.state);
                console.log(`3. EmitAndTo.\t${this.state.name}: ${inspect(token, this.inspectOptions)}`);
                return [true, token];
            }

            case "End": {
                const token =
                    this.buffer.length > 0
                        ? this.createToken(this.buffer)
                        : undefined;
                this.buffer = [];
                console.log(`4. End.\t${this.state.name}: ${inspect(token, this.inspectOptions)}`);
                return [true, token];
            }
        }
    }

    public processCharacters(char: Character): Character | undefined {
        const transition = this.state.handle(char);

        switch (transition.kind) {
            case "Stay":
                if (this.isAccepted())
                    return char;
                break;

            case "To":
                this.transitionTo(transition.state);
                if (this.isAccepted())
                    return char;
                break;

            case "EmitAndTo": {
                this.transitionTo(transition.state);
                return char;
            }

            case "End":
                break;
        }
    }

    private createToken(chars: Character[]): Token {
        if (chars.length === 0) throw new Error('Cannot create token from empty buffer');

        let value = '';
        for (const ch of chars) {
            value += ch.value;
        }

        const ch = {
            value,
            type: chars[0]!.type,
            position: chars[0]!.position
        };

        const token = Context.toTokenType(ch);
        return token;
    }

    public static toTokenType(char: Character): Token {
        const value = char.value;

        if (value.endsWith("%")) {
            return { value, type: TokenType.PERCENT };
        }

        switch (char.type) {
            case CharType.EOF:
                return { value, type: TokenType.EOF };

            case CharType.Whitespace:
                return { value, type: TokenType.WHITESPACE };

            case CharType.NewLine:
                return {value, type: TokenType.NEWLINE }
                
            case CharType.Operator:
                switch (value) {
                    case "+":
                        return { value, type: TokenType.PLUS };
                    case "-":
                        return { value, type: TokenType.MINUS };
                    case ",":
                        return { value, type: TokenType.COMMA };
                    case "/":
                        return { value, type: TokenType.SLASH };
                    case "(":
                        return { value, type: TokenType.LPAREN };
                    case ")":
                        return { value, type: TokenType.RPAREN };
                    case "*":
                    default:
                        return { value, type: TokenType.OPERATOR };
                }
            case CharType.Letter:
                return { value, type: TokenType.IDENTIFIER };

            case CharType.Number:
                return { value, type: TokenType.NUMBER };

            

            default:
                return { value, type: TokenType.ERROR };
        }
    }

    public isAccepted(): boolean {
        return this.state.isAccepting;
    }
}

export { Context };
