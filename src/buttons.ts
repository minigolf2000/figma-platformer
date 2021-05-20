export interface Buttons {
  up: boolean
  left: boolean
  right: boolean
  down: boolean
  run: boolean
  jump: boolean
  esc: boolean
}

export function onButtonsPressed(msg: any, buttonsPressed: Buttons) {
  switch (msg.keyCode as number) {
    case 16: // SHIFT
    case 88: // X
    case 74: // J
    case 73: // I
    case 188: // ,
      buttonsPressed.run = msg.type === 'keydown'
      break
    case 32: // SPACE
    case 75: // K
    case 190: // .
    case 90: // Z
    case 85: // U
      buttonsPressed.jump = msg.type === 'keydown'
      break
    case 37: // LEFT_ARROW
    case 65: // A
      buttonsPressed.left = msg.type === 'keydown'
      break
    case 38: // UP_ARROW
    case 87: // W
      buttonsPressed.up = msg.type === 'keydown'
      break
    case 39: // RIGHT_ARROW
    case 68: // D
      buttonsPressed.right = msg.type === 'keydown'
      break
    case 40: // DOWN_ARROW
    case 83: // S
      buttonsPressed.down = msg.type === 'keydown'
      break
    case 27: // ESC
      buttonsPressed.esc = true
      break
  }
}
