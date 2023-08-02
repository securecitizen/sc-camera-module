declare const errorToFriendly: {
    [key: string]: string;
};
declare function DebugLogger(debug: boolean, value: string): void;
declare const log: (messageOutputElement: HTMLPreElement, ...msg: any[]) => void;
declare function logMessages(...args: any[]): void;
export { errorToFriendly, log, logMessages, DebugLogger };
