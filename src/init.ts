import { onButtonsPressed } from './buttons'
import { findNodesInWorld, getPlayer, setPlayer, setWorldNode, setWorldRectangle } from './lib'
import { Player } from './player'

// Return true if initializing as the server
// Return false if initializing as a client
export function init() {

  const alreadyRunningWorld: FrameNode = figma.currentPage.children.find(n => n.type === "FRAME" && n.getPluginData("playing") === "true") as FrameNode
  if (alreadyRunningWorld) {
    sharedSetup(alreadyRunningWorld)
    return
  }

  if (figma.currentPage.selection[0] && figma.currentPage.selection[0].type === "FRAME") {
    sharedSetup(figma.currentPage.selection[0])
  } else {
    figma.closePlugin("Please select a frame when running plugin")
  }

  figma.currentPage.setRelaunchData({relaunch: ''})
  return
}

const sharedSetup = (worldNode: FrameNode) => {
  worldNode.setRelaunchData({relaunch: ''})
  worldNode.setPluginData("playing", "true")
  setWorldNode(worldNode)
  setWorldRectangle(worldNode)
  findNodesInWorld(worldNode)
  figma.showUI(__html__, {width: 300, height: 100})

  const player = new Player()
  setPlayer(player)
  worldNode.appendChild(player.getNode())

  const pastSelection: string[] = figma.currentPage.selection.map(n => n.id)
  figma.currentPage.selection = []
  figma.ui.onmessage = (m) => onButtonsPressed(m, getPlayer().buttonsPressed)
  figma.viewport.zoom = 4.00


  figma.on("close", () => {
    figma.currentPage.selection = pastSelection.map(id => figma.getNodeById(id)).filter(n => !!n) as SceneNode[]
    !getPlayer().getNode().removed && getPlayer().getNode().remove()
    if (worldNode.findChildren(child => child.name === "player").length === 0) {
      worldNode.setPluginData("playing", "")
    }
    // close and remove plugin data
  })

}
