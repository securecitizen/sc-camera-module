declare const errorToFriendly: {
    [key: string]: string;
};
declare function DebugLogger(debug: boolean, value: string): void;
declare const log: (...msg: any[]) => void;
declare function logMessages(messageOutputElement: HTMLPreElement, ...args: any[]): void;
export { errorToFriendly, log, logMessages, DebugLogger };
