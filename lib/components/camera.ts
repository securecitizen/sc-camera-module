import { ContainerType, IDomContainer, IFullDomContainer } from "../utils/detection";

class SecureCitizenCamera {
    public dom: IFullDomContainer | IDomContainer

    protected sourceDomElements(): void {
        // grab instances of dom objects so we dont have to look them up later
        this.dom.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.dom.log = document.getElementById('messageOutput') as HTMLPreElement;
        this.dom.fps = document.getElementById('fps') as HTMLPreElement;
        this.dom.ok = document.getElementById('ok') as HTMLDivElement;

        // Add additional elements if full
        if(this.dom instanceof IFullDomContainer) {
            this.dom.video = document.getElementById('video') as HTMLVideoElement;
            this.dom.match = document.getElementById('match') as HTMLDivElement;
            this.dom.name = document.getElementById('name') as HTMLInputElement;
            this.dom.save =  document.getElementById('save') as HTMLSpanElement;
            this.dom.delete = document.getElementById('delete') as HTMLSpanElement;
            this.dom.retry = document.getElementById('retry') as HTMLDivElement;
            this.dom.source = document.getElementById('source') as HTMLCanvasElement;
        }
    }

    constructor(type: ContainerType = ContainerType.Minimal){

        switch(type) {
            case ContainerType.Full:
                this.dom = new IFullDomContainer();
                break;
            case ContainerType.Minimal:
                this.dom = new IDomContainer();
                break;
        }

        this.sourceDomElements();
    }
}

export { SecureCitizenCamera };