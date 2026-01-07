import { inspect, styleText, type InspectOptions } from 'node:util';

const MAX_WIDTH: number = 80;

enum Line {
    Default = '─',
    Square = '■',
    Bold = '█',
    Dashed = '-',
    Underscore = '_',
    DoubleUnderscore = '‗',
    Equals = '=',
    Double = '═',
    BoldBottom = '▄',
    BoldTop = '▀',
    Diaeresis = '¨',
    Macron = '¯',
    Section = '§',
    Interpunct = '·',
    LightBlock = '░',
    MediumBlock = '▒',
    HeavyBlock = '▓',
};

/**
 * @interface PrintLineOptions
 * @description Defines the structure for a printLine options object.
 * @property {boolean} preNewLine - If true, adds a newline before the divider.
 * @property {boolean} postNewLine - If true, adds a newline after the divider.
 * @property {number} width - The width of the line.
 * @property {string} line - The character to use for the line.
 */
interface DividerOptions {
    preNewLine?: boolean;
    postNewLine?: boolean;
    width?: number;
    line?: Line;
}

/**
 * @class Divider
 * @description Prints a styled horizontal line to the console.
 * @param {DividerOptions} [options={}] - Configuration options for the line.
 * @returns {void}
 */
class Divider {
    static #instance: Divider;

    private readonly inspectOptions: InspectOptions = {
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

    /**
     * @description Default options object for the printLine function.
     */
    private readonly defaultOptions: DividerOptions = {
        preNewLine: false,      // No preceding new line
        postNewLine: false,     // No successive new line
        width: MAX_WIDTH,       // Use global const MAX_WIDTH = 80
        line: Line.Double,      // Use global const LINE_CHAR = '='          
    };

    // @ts-expect-error
    private options: DividerOptions;
    // @ts-expect-error
    private pre: string;
    // @ts-expect-error
    private post: string;
    // @ts-expect-error
    private divider: string;

    private constructor() {}

    public static get instance(): Divider {
        if (!this.#instance) {
            this.#instance = new Divider();
        }
        return this.#instance;
    }

    public init(options: DividerOptions = {}) {
        this.options = {
            ...this.defaultOptions,
            ...options
        };

        this.pre = this.options.preNewLine ? '\n' : '';
        this.post = this.options.postNewLine ? '\n' : '';
        this.divider = styleText(['gray', 'bold'], this.options.line!.repeat(this.options.width!));
    }

    public toString(): string {
        return `${this.pre}${this.divider}${this.post}`
    }

    public log = (): void => {
        console.log(this.toString());
    }

} // End class PrintLine

// Exports
const PrintLine = (options: DividerOptions = {}): void => {
    const dividerInstance = Divider.instance;
    dividerInstance.init(options);
    dividerInstance.log();
}

export default PrintLine;

export {
    MAX_WIDTH,
    type DividerOptions,
    Divider,
    Line
}