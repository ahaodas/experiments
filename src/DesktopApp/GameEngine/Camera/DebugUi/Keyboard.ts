class Keyboard {
    keyPress: Map<string, () => void> = new Map()
    keyUp: Map<string, () => void> = new Map()
    keyDown: Map<string, () => void> = new Map()
    constructor() {}
    init = () => {
        window.addEventListener('keypress', this.listenKeyPress)
        window.addEventListener('keyup', this.listenKeyUp)
        window.addEventListener('keydown', this.listenKeyDown)
    }
    private listenKeyPress = ({ code }: KeyboardEvent) => this.keyPress.has(code) && this.keyPress.get(code)()
    private listenKeyUp = ({ code }: KeyboardEvent) => this.keyUp.has(code) && this.keyUp.get(code)()
    private listenKeyDown = ({ code }: KeyboardEvent) => this.keyDown.has(code) && this.keyDown.get(code)()
    public destroy = () => {
        window.removeEventListener('keypress', this.listenKeyPress)
    }
}

export default Keyboard
