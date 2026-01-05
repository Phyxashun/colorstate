To simplify the **Tokenizer buffer logic**, you should move the decision of "what to do with the current character" out of the loop in `Tokenizer.ts` and into the `Context.ts`.

Currently, your `Tokenizer` manually checks if it is inside a string and tries to ignore starting quotes with complex conditional logic. By returning a clear `action` (either `buffer` or `ignore`) from the context, the loop becomes a simple set of instructions.

### 1. Update the `Context` Result

First, modify the `process` return type to include an `action`. This tells the tokenizer exactly what to do with the current character.

```typescript
// src/Context.ts

export type Action = 'buffer' | 'ignore';

interface ProcessResult {
    emit: boolean;      // Should we flush the current buffer into a token?
    reprocess: boolean; // Should the current char be looked at again by the next state?
    action: Action;     // Should the current char be added to the buffer?
}

// ... inside Context class ...
public process(char: Character): ProcessResult {
    const transition = this.state.handle(char);
    let action: Action = 'buffer';
    let emit = false;
    let reprocess = false;

    switch (transition.kind) {
        case "BeginString":
            this.beginString(transition.quoteType);
            this.transitionTo(transition.state);
            action = 'ignore'; // Don't put the opening quote in the buffer
            break;

        case "EndString":
            this.endString();
            this.transitionTo(transition.state);
            action = 'ignore'; // Don't put the closing quote in the buffer
            emit = true;
            break;

        case "EmitAndTo":
            this.transitionTo(transition.state);
            emit = true;
            reprocess = true;
            action = 'ignore'; // This char belongs to the NEXT token
            break;

        case "To":
            const wasAccepting = this.isAccepting();
            this.transitionTo(transition.state);
            emit = wasAccepting;
            break;
            
        case "Stay":
            break;
            
        // ... handle other cases like EscapeNext ...
    }

    return { emit, reprocess, action };
}

```

### 2. Simplify the `Tokenizer` Loop

With the `Context` handling the logic, the `tokenize` method becomes much cleaner. You no longer need to manually check for quotes or string states inside the loop.

```typescript
// src/Tokenizer.ts

public tokenize(input: string): Token[] {
    const stream = new CharacterStream(input);
    const tokens: Token[] = [];

    for (const char of stream) {
        // Capture whether we were in a string BEFORE processing 
        // to correctly classify the token being emitted.
        const wasInString = this.ctx.isInString();

        let result = this.ctx.process(char);

        // 1. Handle Emitting (Flush buffer)
        if (result.emit && this.buffer.length > 0) {
            tokens.push(Tokenizer.createToken(this.buffer, wasInString));
            this.buffer = [];
        }

        // 2. Handle Reprocessing (If the char belongs to the next state)
        if (result.reprocess) {
            result = this.ctx.process(char);
        }

        // 3. Simple Buffer Logic
        if (result.action === 'buffer' && char.type !== CharType.EOF) {
            this.buffer.push(char);
        }
    }

    // Flush remaining buffer
    if (this.buffer.length > 0) {
        tokens.push(Tokenizer.createToken(this.buffer, this.ctx.isInString()));
    }

    tokens.push({ value: '', type: TokenType.EOF });
    return tokens;
}

```

### Key Benefits of this Refactor:

* **Separation of Concerns**: The `Tokenizer` loop only manages the flow (looping and list management), while the `Context` manages the grammar logic (when to stop or ignore characters).
* **No More Manual Quote Stripping**: Because the `BeginString` and `EndString` transitions return `action: 'ignore'`, the quotes never enter the buffer, so you don't need logic to remove them later.
* **Consistency**: `EmitAndTo` now consistently marks the "trigger" character as `ignore` for the current token so that it can be correctly picked up by the next `process` call during reprocessing.