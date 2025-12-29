# colorstate

## Install dependencies

```bash
bun install
```

### Running index.ts

```bash
bun run index.ts
```

### Or, after updating package.json

```json
{
    "scripts": {
        "start": "bun run ./index.ts"
    }
}
```

```bash
bun start
```

## Adding Node and Bun types

```bash
bun add -d @types/node @types/bun
```

## Adding Vitest and Coverage for testing

```bash
bun add -d vitest
```

Choose coverage:

* V8 Coverage

    ```bash
    bun add -d @vitest/coverage-v8
    ```

* Istanbul Coverage

    ```bash
    bun add -d @vitest/coverage-istanbul
    ```

## Create vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: [
                'src/**/*.ts',
                'tests/**/*.test.ts'
            ]
        }
    }
})
```

## Running tests

### Update package.json

```json
{
    "scripts": {
        "start": "bun run ./index.ts",
        "test": "vitest",
        "coverage": "vitest --coverage"
    }
}
```

### Run test with no watch

```bash
bun test
```

### Run test with watch

```bash
bun run test
```

### Run test with watch and coverage

```bash
bun coverage
```

### Ignoring lines

To ignore coverage in a test, add the comments below, above the line/block that
should be ignored:

* V8 Coverage
  
    ```typescript
    /* v8 ignore */
    ```

* Istanbul Coverage

    ```typescript
    /* istanbul ignore */
    ```

* ### if else

    ```typescript
    /* v8 ignore if -- @preserve */
    if (parameter) { 
        console.log('Ignored') 
    } else {
        console.log('Included')
    }

    /* v8 ignore else -- @preserve */
    if (parameter) {
        console.log('Included')
    } else { 
        console.log('Ignored') 
    } 
    ```

* ### next node

    ```typescript
    /* v8 ignore next -- @preserve */
    console.log('Ignored') 
    console.log('Included')

    /* v8 ignore next -- @preserve */
    function ignored() { 
        console.log('all') 
        console.log('lines') 
        console.log('are') 
        console.log('ignored') 
    } 

    /* v8 ignore next -- @preserve */
    class Ignored { 
        ignored() {} 
        alsoIgnored() {} 
    } 

    /* v8 ignore next -- @preserve */
    condition 
        ? console.log('ignored') 
        : console.log('also ignored') 
    ```

* ### try catch

    ```typescript
    /* v8 ignore next -- @preserve */
    try { 
        console.log('Ignored') 
    } 
    catch (error) { 
        console.log('Ignored') 
    } 

    try {
        console.log('Included')
    }
    catch (error) {
        /* v8 ignore next -- @preserve */
        console.log('Ignored') 
        /* v8 ignore next -- @preserve */
        console.log('Ignored') 
    }

    // Requires rolldown-vite due to esbuild's lack of support.
    // See https://vite.dev/guide/rolldown.html#how-to-try-rolldown
    try {
        console.log('Included')
    }
    catch (error) /* v8 ignore next */ { 
        console.log('Ignored') 
    } 
    ```

* ### switch case

    ```typescript
    switch (type) {
        case 1:
            return 'Included'

        /* v8 ignore next -- @preserve */
        case 2: 
            return 'Ignored'

        case 3:
            return 'Included'

        /* v8 ignore next -- @preserve */
        default: 
            return 'Ignored'
    }
    ```

* ### whole file

    ```typescript
    /* v8 ignore file -- @preserve */
    export function ignored() { 
        return 'Whole file is ignored'
    }
    ```

This project was created using `bun init` in bun v1.3.4. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
