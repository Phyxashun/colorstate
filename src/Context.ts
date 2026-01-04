// src/Context.ts

import { type Character, CharType } from './Character.ts';
import { InitialState, State } from './States.ts';
import { Transition } from './Transition.ts';

interface StringContext {
    openingQuoteType: CharType | null;
    isEscaping: boolean;
    nestingLevel: number;
}

class Context {
    private stringContext: StringContext = {
        openingQuoteType: null,
        isEscaping: false,
        nestingLevel: 0,
    };

    constructor(private state: State = InitialState) { }

    public transitionTo(state: State): void {
        this.state = state;
    }

    public getCurrentState(): State {
        return this.state;
    }

    public beginString(quoteType: CharType): void {
        this.stringContext.openingQuoteType = quoteType;
        this.stringContext.nestingLevel++;
    }

    public endString(): void {
        this.stringContext.nestingLevel = Math.max(0, this.stringContext.nestingLevel - 1);
        if (this.stringContext.nestingLevel === 0) {
            this.stringContext.openingQuoteType = null;
        }
    }

    public setEscaping(value: boolean): void {
        this.stringContext.isEscaping = value;
    }

    public isEscaping(): boolean {
        return this.stringContext.isEscaping;
    }

    public isInString(): boolean {
        return this.stringContext.nestingLevel > 0;
    }

    public getOpeningQuoteType(): CharType | null {
        return this.stringContext.openingQuoteType;
    }

    public isMatchingQuote(quoteType: CharType): boolean {
        return this.stringContext.openingQuoteType === quoteType;
    }

    public process(char: Character): { emit: boolean; reprocess: boolean, endString?: boolean } {
        const wasAccepting = this.isAccepting();
        const transition: Transition = this.getCurrentState().handle(char);

        if (transition.kind === "EndString" && this.isInString()) {
            if (this.isMatchingQuote(char.type)) {
                this.endString();
                this.transitionTo(transition.state);
                return { emit: true, reprocess: false };
            } else {
                return { emit: false, reprocess: false };
            }
        }

        if (this.isEscaping() && transition.kind !== "EscapeNext") {
            this.setEscaping(false);
            return { emit: false, reprocess: false };
        }

        switch (transition.kind) {
            case "BeginString": {
                this.beginString(transition.quoteType);
                this.transitionTo(transition.state);
                return { emit: false, reprocess: false };
            }

            case "EscapeNext": {
                this.setEscaping(true);
                this.transitionTo(transition.state);
                return { emit: false, reprocess: false };
            }

            case "EndString": {
                this.endString();
                this.transitionTo(transition.state);
                return { emit: true, reprocess: false, endString: true };
            }

            case "ToContinue": {
                this.transitionTo(transition.state);
                break;
            }

            case "EmitAndTo": {
                this.transitionTo(transition.state);
                return { emit: true, reprocess: true };
            }

            case "To": {
                const shouldEmit = wasAccepting;
                this.transitionTo(transition.state);
                if (shouldEmit) return { emit: true, reprocess: false };
                break;
            }

            case "Stay": {
                break;
            }
        }

        return { emit: false, reprocess: false };
    }

    public isAccepting(): boolean {
        return this.state.isAccepting;
    }
}

export {
    type StringContext,
    Context
}