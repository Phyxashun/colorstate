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

    public process(char: Character): boolean {
        const transition: Transition = this.state.handle(char);

        switch (transition.kind) {
            case "EmitAndTo": {
                this.transitionTo(transition.state);
                return EMIT;
            }
            
            case "To": {
                if (this.isAccepted()) {
                    return NO_EMIT;
                }
                this.transitionTo(transition.state);
                break;
            }

            case "Stay": {
                if (this.isAccepted()) {
                    return NO_EMIT;
                }
                break;
            }
        }

        return NO_EMIT;
    }

    public isAccepted(): boolean {
        return this.state.isAccepting;
    }
}

export { Context };
