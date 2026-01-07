// src/Context.ts

import Char, { type Character } from './Character.ts';
import { InitialState, State } from './States.ts';
import { Transition } from './Transition.ts';

type Action = 'buffer' | 'ignore';

interface ProcessResult {
    emit: boolean;      // Should we flush the current buffer into a token?
    reprocess: boolean; // Should the current char be looked at again by the next state?
    action: Action;     // Should the current char be added to the buffer?
}

interface StringContext {
    openingQuoteType: Char.Type | null;
    isEscaping: boolean;
    nestingLevel: number;
}

class Context {
    private state: State = InitialState;
    private stringContext: StringContext = {
        openingQuoteType: null,
        isEscaping: false,
        nestingLevel: 0,
    };

    constructor() { }

    public transitionTo(state: State): void {
        this.state = state;
    }

    public getCurrentState(): State {
        return this.state;
    }

    public beginString(quoteType: Char.Type): void {
        this.stringContext.openingQuoteType = quoteType;
        this.stringContext.nestingLevel++;
    }

    public endString(quoteType: Char.Type): void {
        this.stringContext.nestingLevel = Math.max(0, this.stringContext.nestingLevel - 1);
        if (this.stringContext.nestingLevel === 0) {
            this.stringContext.openingQuoteType = null;
        }
    }

    public isInString(): boolean {
        return this.stringContext.nestingLevel > 0;
    }

    public getOpeningQuoteType(): Char.Type | null {
        return this.stringContext.openingQuoteType;
    }

    public isMatchingQuote(quoteType: Char.Type): boolean {
        return this.stringContext.openingQuoteType === quoteType;
    }

    public setEscaping(value: boolean): void {
        this.stringContext.isEscaping = value;
    }

    public isEscaping(): boolean {
        return this.stringContext.isEscaping;
    }

    public process(char: Character): ProcessResult {
        const transition: Transition = this.state.handle(char);
        let emit = false;
        let reprocess = false;
        let action: Action = 'buffer';

        switch (transition.kind) {
            case "BeginString": {
                this.beginString(transition.quoteType);
                this.transitionTo(transition.state);
                action = 'ignore'; // Don't put the opening quote in the buffer
                break;
            }

            case "EndString": {
                if (!this.isMatchingQuote(char.type)) break;
                this.endString(transition.quoteType);
                this.transitionTo(transition.state);
                action = 'ignore'; // Don't put the closing quote in the buffer
                emit = true;
                break;
            }

            case "EmitAndTo": {
                this.transitionTo(transition.state);
                emit = true;
                reprocess = true;
                action = 'ignore'; // This char belongs to the NEXT token
                break;
            }

            case "To": {
                const wasAccepting = this.isAccepting();
                this.transitionTo(transition.state);
                emit = wasAccepting;
                break;
            }

            case "Stay": {
                break;
            }

            case "EscapeNext": {
                this.setEscaping(true);
                this.transitionTo(transition.state);
                reprocess = true;
                action = 'buffer';
                break;
            }

            case "ToContinue": {
                this.transitionTo(transition.state);
                emit = false;
                reprocess = false;
                action = 'buffer';
                break;
            }
        }

        return { emit, reprocess, action };
    }

    public isAccepting(): boolean {
        return this.state.isAccepting;
    }
}

export {
    type Action,
    type ProcessResult,
    type StringContext,
    Context
}