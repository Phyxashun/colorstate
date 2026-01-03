// src/Transition.ts

import { State } from './States.ts';

export type Transition =
    | { kind: 'Stay' }
    | { kind: 'To'; state: State }
    | { kind: 'EmitAndTo'; state: State }
    | { kind: 'ToContinue'; state: State };

type TransitionFn =
    & { Stay:       () => Transition; } 
    & { To:         (state: State) => Transition; } 
    & { EmitAndTo:  (state: State) => Transition; }
    & { ToContinue: (state: State) => Transition; };

export const Transition: TransitionFn = {
    Stay: (): Transition => ({ kind: 'Stay' }),
    To: (state: State): Transition => ({ kind: 'To', state }),
    EmitAndTo: (state: State): Transition => ({ kind: 'EmitAndTo', state }),
    ToContinue: (state: State): Transition => ({ kind: 'ToContinue', state }),
};