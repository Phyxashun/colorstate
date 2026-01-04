// src/Context.ts

import { type Character } from "./Character.ts";
import { State, InitialState } from "./States.ts";
import { Transition } from './Transition.ts';

class Context {
    constructor(private state: State = InitialState) { }

    public process(char: Character): { emit: boolean; reprocess: boolean } {
        const wasAccepting = this.isAccepting();
        const transition: Transition = this.handle(char);

        switch (transition.kind) {
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

            case "ToContinue": {
                this.transitionTo(transition.state);
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

    private handle(char: Character): Transition {
        return this.state.handle(char);
    }

    public transitionTo(state: State): void {
        this.state = state;
    }
}

export { Context };
