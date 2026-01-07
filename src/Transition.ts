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