// src/Context.ts

import { inspect, type InspectOptions } from 'node:util';
import { type Character } from "./Character.ts";
import { State } from "./States.ts";
import { Transition } from './Transition.ts';

const EMIT = true;
const NO_EMIT = false;

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

    constructor(initialState: State) {
        this.state = initialState;
    }

    public transitionTo(state: State): void {
        this.state = state;
    }

    public process(char: Character): { emit: boolean; reprocess: boolean } {
        const wasAccepting = this.state.isAccepting;
        const transition: Transition = this.state.handle(char);

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

            case "Stay": {
                break;
            }
        }

        return { emit: false, reprocess: false };
    }

    public isAccepted(): boolean {
        return this.state.isAccepting;
    }
}

export { Context };
