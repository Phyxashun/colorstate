// src/Character.ts

import { inspect, type InspectOptions } from 'node:util';

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

type ClassifyFunction = (char: string) => CharType;
type CharTypeFn = (char: string) => boolean;
type Spec = Map<CharType, CharTypeFn>;

enum CharType {
    Start = 'Start',
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',
    Letter = 'Letter',
    Number = 'Number',
    Operator = 'Operator',
    Other = 'Other',
    EOF = 'EOF',
    Error = 'Error',
}

interface Position {
    index: number;
    line: number;
    column: number;
}

interface ICharacter {
    value: string;
    type: CharType;
    position: Position;
}

class Character implements ICharacter {
    public value: string = '';
    public type: CharType = CharType.Start;
    public position: Position = {
        index: 0,
        line: 1,
        column: 1
    };

    public static Letters: Set<string> = new Set([
        // Uppercase
        'A', 'B', 'C', 'D', 'E',
        'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O',
        'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y',
        'Z',

        // Lowercase
        'a', 'b', 'c', 'd', 'e',
        'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o',
        'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y',
        'z',
    ]);

    public static Numbers: Set<string> = new Set([
        '1', '2', '3', '4', '5',
        '6', '7', '8', '9', '0',
    ]);

    public static Operators: Set<string> = new Set([
        '`', '~', '!', '@', '#',
        '$', '%', '^', '&', '*',
        '(', ')', '-', '_', '=',
        '+', '[', ']', '{', '}',
        ';', ':', "'", '"', ',',
        '<', '>', '.', '/', '?',
        '|', '\\',
    ]);

    public static Whitespace: Set<string> = new Set([
        ' ', '\t',
    ]);

    public static NewLine: Set<string> = new Set([
        '\n', '\r',
    ]);

    public static CharSpec: Spec = new Map<CharType, CharTypeFn>([
        [CharType.EOF, (char) => char === ''],
        [CharType.Whitespace, (char) => Character.Whitespace.has(char)],
        [CharType.NewLine, (char) => Character.NewLine.has(char)],
        [CharType.Letter, (char) => Character.Letters.has(char)],
        [CharType.Number, (char) => Character.Numbers.has(char)],
        [CharType.Operator, (char) => Character.Operators.has(char)],
    ]);

    public static classify: ClassifyFunction = (char: string): CharType => {
        if (!char) return CharType.Other;

        for (const [charType, fn] of Character.CharSpec) {
            if (fn(char)) return charType as CharType;
        }

        return CharType.Error;
    };
}

class ListNode {
    public next: ListNode | null = null;
    constructor(public value: ICharacter) { }
}

class CharacterList implements IterableIterator<ICharacter> {
    private iteratorNode: ListNode | null = null;
    private _length: number = 0;
    
    private head: ListNode | null = null;
    private tail: ListNode | null = null;

    get length(): number { return this._length; }

    public [Symbol.iterator](): IterableIterator<ICharacter> {
        this.iteratorNode = this.head;
        return this;
    }

    public next(): IteratorResult<ICharacter> {
        if (this.iteratorNode) {
            const value = this.iteratorNode.value;
            this.iteratorNode = this.iteratorNode.next;
            return { done: false, value };
        }
        return { done: true, value: undefined as any };
    }

    public push(value: ICharacter): void {
        const newNode = new ListNode(value);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else if (this.tail) {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this._length++;
    }

    public pop(): ICharacter | undefined {
        if (!this.head) return undefined;
        const value = this.head.value;
        this.head = this.head.next;
        if (!this.head) this.tail = null;
        this._length--;
        return value;
    }

    public peek(): ICharacter | undefined {
        return this.head?.value;
    }

    public traverse(): void {
        let current = this.head;
        while (current) {
            console.log('Traversing:', inspect(current.value, inspectOptions));
            current = current.next;
        }
    }

    public display(): void {
        let current = this.head;
        const elements: ICharacter[] = [];
        while (current) {
            elements.push(current.value);
            current = current.next;
        }
        console.log(inspect(elements.join(" -> "), inspectOptions));
    }
}

class CharacterStream implements IterableIterator<ICharacter> {
    private readonly source: string;
    protected list: CharacterList;

    private currentChar: ICharacter = {
        value: '',
        type: CharType.Start,
        position: {
            index: 0,
            line: 1,
            column: 1
        }
    };

    constructor(input: string) {
        this.source = input;
        this.list = new CharacterList();
        this.init();
    }

    public init(): void {
        if (!this.source) {
            this.list.push(this.atEOF());
            return;
        }

        for (const char of this.source) {
            this.currentChar = {
                value: char,
                type: Character.classify(char),
                position: { ...this.currentChar.position }
            };

            this.list.push({ ...this.currentChar });
            this.advance();
        }

        this.list.push(this.atEOF());
    }

    public next(): IteratorResult<ICharacter> {
        return this.list.next();
    }

    public [Symbol.iterator](): IterableIterator<ICharacter> {
        return this.list[Symbol.iterator]();
    }

    public advance(): void {
        const newPosition = { ...this.currentChar.position };
        
        newPosition.index++;
        if (this.currentChar.value === '\n') {
            newPosition.line++;
            newPosition.column = 1;
        } else {
            newPosition.column++;
        }
        
        this.currentChar.position = { ...newPosition };
    }

    public peek(): ICharacter {
        return this.list.peek() ?? this.atEOF();
    }

    public isEOF(): boolean {
        return this.currentChar.position.index >= this.source.length;
    }

    public atEOF(): ICharacter {
        return ({
            value: '',
            type: CharType.EOF,
            position: { ...this.currentChar.position },
        });
    }

    public atError(): ICharacter {
        return {
            value: 'Error',
            type: CharType.Other,
            position: { ...this.currentChar.position }
        };
    }
}

export {
    type Position,
    CharType,
    Character,
    CharacterStream,
}