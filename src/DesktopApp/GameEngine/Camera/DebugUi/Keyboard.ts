class Keyboard {
    keyPress: Map<string, () => void> = new Map()
    keyUp: Map<string, () => void> = new Map()
    keyDown: Map<string, () => void> = new Map()
    shitKeyDown: Map<string, () => void> = new Map()

    constructor() {}

    init = () => {
        window.addEventListener('keypress', this.listenKeyPress)
        window.addEventListener('keyup', this.listenKeyUp)
        window.addEventListener('keydown', this.listenKeyDown)
    }
    private withPrevention = (cb: (e: KeyboardEvent) => void) => (e: KeyboardEvent) => {
        if (this.keyUp.has(e.code) || this.keyPress.has(e.code) || this.keyDown.has(e.code) || this.shitKeyDown.has(e.code)) {
            e.preventDefault()
            cb(e)
        }
    }
    private listenKeyPress = this.withPrevention(
        ({ code }: KeyboardEvent) => this.keyPress.has(code) && this.keyPress.get(code)()
    )
    private listenKeyUp = this.withPrevention(({ code }: KeyboardEvent) => this.keyUp.has(code) && this.keyUp.get(code)())
    private listenKeyDown = this.withPrevention((e: KeyboardEvent) => {
        const { code, shiftKey } = e
        this.keyDown.has(code) && this.keyDown.get(code)()
        shiftKey && this.shitKeyDown.has(code) && this.shitKeyDown.get(code)()
    })

    public destroy = () => {
        window.removeEventListener('keypress', this.listenKeyPress)
    }
}

export default Keyboard
