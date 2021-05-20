export const COLLISION_TILES = new Set(['ground', 'block', 'q-block'])
export const WATER_TILES = new Set(['water'])
export const DECORATIVE_TILES = new Set(['dirt', 'bridge', 'stairs'])

interface Walls {
  [x: number]: {
    [y: number]: boolean
  }
}

let tiles: Tiles
export function getTiles() {
  return tiles
}

export class Tiles {
  private walls: Walls = {}

  public constructor(worldNode: FrameNode, tileNodes: InstanceNode[]) {

    const tilesFrame = figma.createFrame()
    tilesFrame.name = "collision tiles"
    tilesFrame.resize(worldNode.width, worldNode.height)
    tilesFrame.fills = []

    tileNodes.forEach((node: InstanceNode) => {
      if (COLLISION_TILES.has(node.name)) {
        if (!this.walls[node.x]) {this.walls[node.x] = {}}
        this.walls[node.x][node.y] = true
        tilesFrame.appendChild(node)
      }

      if (DECORATIVE_TILES.has(node.name)) {
        tilesFrame.appendChild(node)
      }
      return false
    })

    worldNode.appendChild(tilesFrame)

    tiles = this
  }
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

/* If rectangles are overlapping, return a normal Vector from rect1 to rect 2
 * Else return null
 */
export function isOverlapping(rect1: Rectangle, rect2: Rectangle) {
  if (rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  ) {
    return rect2
  }
  return null
}

// Return a vector representing the midpoint of the rectangle
export function midpoint(r: Rectangle): Vector {
  return {x: r.x + r.width / 2, y: r.y + r.height / 2}
}
