export class IDomContainer {
    canvas: HTMLCanvasElement
    fps: HTMLPreElement
    ok: HTMLDivElement
}

export class IFullDomContainer extends IDomContainer {
    match: HTMLDivElement
    name: HTMLInputElement
    save: HTMLSpanElement
    delete: HTMLSpanElement
    retry: HTMLDivElement
    source: HTMLCanvasElement
}

export enum ContainerType {
    Minimal,
    Full
}

export const ok: Record<string, { status: boolean | undefined; val: number }> = {
    // must meet all rules
    faceCount: { status: false, val: 0 },
    faceConfidence: { status: false, val: 0 },
    facingCenter: { status: false, val: 0 },
    lookingCenter: { status: false, val: 0 },
    blinkDetected: { status: false, val: 0 },
    faceSize: { status: false, val: 0 },
    antispoofCheck: { status: false, val: 0 },
    livenessCheck: { status: false, val: 0 },
    distance: { status: false, val: 0 },
    age: { status: false, val: 0 },
    gender: { status: false, val: 0 },
    timeout: { status: true, val: 0 },
    descriptor: { status: false, val: 0 },
    elapsedMs: { status: undefined, val: 0 }, // total time while waiting for valid face
    detectFPS: { status: undefined, val: 0 }, // mark detection fps performance
    drawFPS: { status: undefined, val: 0 }, // mark redraw fps performance
}

export const allOk = () =>
ok.faceCount.status &&
ok.faceSize.status &&
ok.blinkDetected.status &&
ok.facingCenter.status &&
ok.lookingCenter.status &&
ok.faceConfidence.status &&
ok.antispoofCheck.status &&
ok.livenessCheck.status &&
ok.distance.status &&
ok.descriptor.status &&
ok.age.status &&
ok.gender.status

export function drawValidationTests(dom: IDomContainer) {
    let y = 32
    for (const [key, val] of Object.entries(ok)) {
        let el = document.getElementById(`ok-${key}`)
        if (!el) {
            el = document.createElement('div')
            el.id = `ok-${key}`
            el.innerText = key
            el.className = 'ok'
            el.style.top = `${y}px`
            dom.ok.appendChild(el)
        }
        if (typeof val.status === 'boolean')
            el.style.backgroundColor = val.status ? 'lightgreen' : 'lightcoral'
        const status = val.status ? 'ok' : 'fail'
        el.innerText = `${key}: ${val.val === 0 ? status : val.val}`
        y += 28
    }
}