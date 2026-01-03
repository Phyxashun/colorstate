// src/States.ts

import { inspect, type InspectOptions } from 'node:util';
import { Character, CharType } from './Character.ts';
import { Transition } from './Transition';

abstract class State {
    public name: string = 'State';
    public abstract isAccepting: boolean;
    protected inspectOptions: InspectOptions = {
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

    constructor(name: string) {
        this.name = name;
    }

    public toString(): string {
        return `\t${inspect(this, this.inspectOptions)}`;
    }

    public abstract handle(char: Character): Transition;
}

class Initial_State extends State {
    public isAccepting: boolean = false;

    constructor() {
        super('InitialState');
    }

    public handle(char: Character): Transition {
        switch (char.type) {
            case CharType.Whitespace:
                return Transition.To(new Whitespace_State());
            case CharType.NewLine:
                return Transition.To(new NewLine_State());
            case CharType.EOF:
                return Transition.To(new End_State());
            case CharType.Operator:
                return Transition.To(new Operator_State());
            case CharType.Letter:
                return Transition.To(new Letter_State());
            case CharType.Number:
                return Transition.To(new Number_State());
            default:
                return Transition.Stay();
        }
    }
}

class Whitespace_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('WhitespaceState');
    }

    public handle(char: Character): Transition {
        if (char.type !== CharType.Whitespace) {
            return Transition.EmitAndTo(new Initial_State());
        }
        return Transition.Stay();
    }
}

class NewLine_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('HexState');
    }

    public handle(char: Character): Transition {
        if (char.type !== CharType.NewLine) {
            return Transition.EmitAndTo(new Initial_State());
        }
        return Transition.Stay();
    }
}

class Letter_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('LetterState');
    }

    public handle(char: Character): Transition {
        if (char.type !== CharType.Letter) {
            return Transition.EmitAndTo(new Initial_State());
        }
        return Transition.Stay();
    }
}

class Number_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('NumberState');
    }

    public handle(char: Character): Transition {
        if (char.type !== CharType.Number) {
            return Transition.EmitAndTo(new Initial_State());
        }
        return Transition.Stay();
    }
}

class Percent_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('PercentState');
    }

    public handle(_: Character): Transition {
        return Transition.EmitAndTo(new Initial_State());
    }
}

class Operator_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('OperatorState');
    }

    public handle(char: Character): Transition {
        return Transition.EmitAndTo(new Initial_State());
    }
}

class End_State extends State {
    public isAccepting: boolean = true;

    constructor() {
        super('EndState');
    }

    public handle(_: Character): Transition {
        return Transition.End();
    }
}

export {
    State,
    Initial_State,
    Whitespace_State,
    NewLine_State,
    Letter_State,
    Number_State,
    Percent_State,
    Operator_State,
    End_State,
}