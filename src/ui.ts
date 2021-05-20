import './ui.css'

const uiEl = document.getElementById('ui')!
uiEl.focus()
uiEl.onkeydown = (e: KeyboardEvent) => {
  if (!e.repeat) {
    parent.postMessage({ pluginMessage: { type: 'keydown', keyCode: e.keyCode } }, '*')
  }
}
uiEl.onkeyup = (e: KeyboardEvent) => {
  parent.postMessage({ pluginMessage: { type: 'keyup', keyCode: e.keyCode } }, '*')
}
uiEl.onblur = () => {
  parent.postMessage({ pluginMessage: { type: 'blur' } }, '*')
}
uiEl.onfocus = () => {
  parent.postMessage({ pluginMessage: { type: 'focus' } }, '*')
}

onmessage = (event) => {
  if (!event.data.pluginMessage) { return }
  const { numLives, color, death } = event.data.pluginMessage

  if (numLives !== undefined) {
    const livesNode = document.getElementById("numLives")
    if (livesNode) {
      livesNode.textContent = numLives
    }
    if (numLives === 0) {
      const aliveNode = document.getElementById("alive")
      if (aliveNode) {
        aliveNode.classList.add("last-life")
      }
    }
  }
  if (color !== undefined) {
    const aliveNode = document.getElementById("alive")
    if (aliveNode) {
      aliveNode.classList.remove("dead")
    }

    const shipNode = document.getElementById("ship")
    if (shipNode) {
      const {r, g, b} = color
      const pathNode = shipNode.children[0] as SVGElement
      pathNode.style.fill = `rgb(${r*255},${g*255},${b*255})`
    }
  }
  if (death) {
    const aliveNode = document.getElementById("alive")
    if (aliveNode) {
      aliveNode.classList.add("dead")
    }
  }
}