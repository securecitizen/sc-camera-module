export declare class IDomContainer {
    canvas: HTMLCanvasElement;
    fps: HTMLPreElement;
    ok: HTMLDivElement;
}
export declare class IFullDomContainer extends IDomContainer {
    match: HTMLDivElement;
    name: HTMLInputElement;
    save: HTMLSpanElement;
    delete: HTMLSpanElement;
    retry: HTMLDivElement;
    source: HTMLCanvasElement;
}
export declare enum ContainerType {
    Minimal = 0,
    Full = 1
}
export declare const ok: Record<string, {
    status: boolean | undefined;
    val: number;
}>;
export declare const allOk: () => boolean | undefined;
export declare function drawValidationTests(dom: IDomContainer): void;
