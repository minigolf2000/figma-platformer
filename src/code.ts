import { init } from './init'
import { FPS, getPlayer, getWorldNode, updateCamera } from './lib'

// Game loop run by multiplayerPlayers
function nextFrame() {
  const player = getPlayer()
  if (player.buttonsPressed.esc) {
    figma.closePlugin()
    return
  }
  if (getWorldNode().removed) {
    figma.closePlugin("World was deleted, exiting plugin")
    return
  }

  // scan for new rectangles on every frame

  player.nextFrame()

  const midpoint = player.getCurrentMidpoint()
  if (midpoint) updateCamera(midpoint, 20)
}

let lastFrameTimestamp: number = Date.now()
export function printFPS() {
  const currentFrameTimestamp = Date.now()
  const fps = Math.round(1000 / (currentFrameTimestamp - lastFrameTimestamp))
  lastFrameTimestamp = currentFrameTimestamp
  console.info(`fps: ${fps}`)
}


init()
setInterval(nextFrame, 1000 / FPS)