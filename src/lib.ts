import { Player } from "./player"

export const FPS = 30

let rectangles: Rectangle[] = []
export const findNodesInWorld = (worldNode: FrameNode) => {
  // findAll is an expensive call so we only do it once
  worldNode.findAll((node: SceneNode) =>
    !node.removed && node.type === 'RECTANGLE' && node.rotation === 0 && node.visible && node.name !== "bg"
  ).forEach((node: SceneNode) => {
    rectangles.push({
      height: node.height,
      width: node.width,
      x: node.x,
      y: node.y,
    })
  })

  // Top rectangle
  rectangles.push({
    x: 0,
    y: -worldNode.height,
    width: worldNode.width,
    height: worldNode.height,
  })
  // Bottom rectangle
  rectangles.push({
    x: 0,
    y: worldNode.height,
    width: worldNode.width,
    height: worldNode.height,
  })
  // Left rectangle
  rectangles.push({
    x: -worldNode.width,
    y: 0,
    width: worldNode.width,
    height: worldNode.height,
  })
  // Right rectangle
  rectangles.push({
    x: worldNode.width,
    y: 0,
    width: worldNode.width,
    height: worldNode.height,
  })
}

export function getRectangles() {
  return rectangles
}

let worldNode: FrameNode
export function setWorldNode(w: FrameNode) {
  worldNode = w
}

export function getWorldNode() {
  return worldNode
}

let worldRectangle: Rectangle
export function setWorldRectangle(w: Rectangle) {
  const {width, height, x, y} = w
  worldRectangle = {width, height, x, y}
}

export function getWorldRectange() {
  return worldRectangle
}

let player: Player
export function setPlayer(p: Player) {
  player = p
}
export function getPlayer() {
  return player
}

let currentCenter: Vector = figma.viewport.center
export function updateCamera(linkPosition: Rectangle, cameraBoxSize: number) {
  // TODO: does this take link's width/height into account?
  const distFromCenter = cameraBoxSize / 3.5
  const currentX = linkPosition.x + worldRectangle.x
  const currentY = linkPosition.y + worldRectangle.y

  let newX = currentCenter.x
  if (currentCenter.x - currentX > distFromCenter) {
    newX -= currentCenter.x - currentX - distFromCenter
  } else if (currentX - currentCenter.x > distFromCenter) {
    newX += currentX - currentCenter.x - distFromCenter
  }

  let newY = currentCenter.y
  if (currentCenter.y - currentY > distFromCenter) {
    newY -= currentCenter.y - currentY - distFromCenter
  } else if (currentY - currentCenter.y > distFromCenter) {
    newY += currentY - currentCenter.y - distFromCenter
  }

  if (newX !== currentCenter.x || newY !== currentCenter.y) {
    currentCenter = {x: newX, y: newY}
    figma.viewport.center = currentCenter
  }
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}
