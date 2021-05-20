import { getRectangles, getWorldRectange } from "./lib"
import { Buttons } from "./buttons"
import { Rectangle } from "./lib"

import { isOverlapping } from "./tiles"

const HEIGHT = 16
const HEIGHT_CROUCHING = 12
const WIDTH = 6
const MAX_X_WALKING_VELOCITY = 2
const MAX_X_RUNNING_VELOCITY = 5
const MAX_Y_VELOCITY = 10
const RUNNING_ACCELERATION = .7
const WALKING_ACCELERATION = .7
const GRAVITY = 1
const FRICTION = .3
const JUMPING_FORCE = 5
const MIN_JUMP_FRAMES = 2 // Minimum number of frames that a jump will increase y velocity for
const MAX_JUMP_FRAMES = 8 // Maximum number of frames that y velocity can be increased for

export class Player {
  public buttonsPressed: Buttons = {up: false, left: false, right: false, down: false, jump: false, run: false, esc: false}
  private node: FrameNode

  private xPos: number
  private yPos: number
  private xVel: number
  private yVel: number

  // Current number of frames spent jumping
  private currentJumpFrames: number

  // True if player is still holding jump button during a jump
  private holdingJump: boolean

  private deathTimer: number | null

  private framesLeft: number
  private spriteX: number
  private spriteY: number
  private crouching: boolean




  private currentMidpoint: Rectangle // repeatedly accessing Figma node objects is slow. store this value locally

  public constructor() {
    this.node = figma.createNodeFromSvg(BLOCKY_SVG)

    this.node.clipsContent = true
    this.node.name = "player"
    this.node.locked = true
    this.deathTimer = null
    this.currentJumpFrames = 1
    this.crouching = false

    this.framesLeft = 0
    this.spriteX = 0
    this.spriteY = 0
    this.holdingJump = false

    this.newShip()
  }

  private newShip() {
    // const { width, height } = getWorldNode()
    this.xPos = 20
    this.yPos = getWorldRectange().height - HEIGHT
    this.xVel = 0
    this.yVel = -1
    this.node.x = this.xPos
    this.node.y = this.yPos
    // this.node.resizeWithoutConstraints(8, 16)
    this.node.resizeWithoutConstraints(12, 16)
    this.currentMidpoint = {x: this.node.x, y: this.node.y, width: WIDTH, height: HEIGHT}
    this.currentJumpFrames = MAX_JUMP_FRAMES
  }

  public getNode() {
    return this.node
  }

  public getCurrentMidpoint(): Rectangle | null {
    if (this.deathTimer) {
      return null
    }
    return this.currentMidpoint
  }

  public setCurrentPosition(position: Vector) {
    this.currentMidpoint.x = position.x
    this.currentMidpoint.y = position.y

    this.node.x = position.x
    this.node.y = position.y
  }

  private update() {
    const rectangles = getRectangles()
    // Increment jump frames
    if (this.currentJumpFrames > 0) {
      this.currentJumpFrames++
    }

    if (!this.crouching && this.buttonsPressed.down) {
      this.yPos += HEIGHT - HEIGHT_CROUCHING
      this.crouching = true
    }
    if (this.crouching && !this.buttonsPressed.down) {
      this.yPos -= HEIGHT - HEIGHT_CROUCHING
      this.crouching = false
    }
    // Apply x friction
    this.xVel = this.xVel > 0 ? Math.max(0, this.xVel - FRICTION) : Math.min(0, this.xVel + FRICTION)

    // Player let go of jump
    if (!this.buttonsPressed.jump) {
      this.holdingJump = false
    }

    // console.log("currentJumpFrames", this.currentJumpFrames)
    // console.log("holdilngJump", this.holdingJump)
    // Jump upward acceleration
    if (this.currentJumpFrames > 0 &&
        (this.currentJumpFrames < MIN_JUMP_FRAMES ||
          this.holdingJump && this.currentJumpFrames < MAX_JUMP_FRAMES
        )) {
      // console.log("apply jumping force")
      this.yVel = -JUMPING_FORCE
    } else {
      this.yVel = Math.min(this.yVel + GRAVITY, MAX_Y_VELOCITY)
    }

    // Left & right movement
    if (this.buttonsPressed.left && !this.buttonsPressed.right && !this.buttonsPressed.down) {
      this.xVel = this.buttonsPressed.run ?
        Math.max(this.xVel - RUNNING_ACCELERATION, -MAX_X_RUNNING_VELOCITY) :
        Math.max(this.xVel - WALKING_ACCELERATION, -MAX_X_WALKING_VELOCITY)
    }
    if (this.buttonsPressed.right && !this.buttonsPressed.left && !this.buttonsPressed.down) {
      this.xVel = this.buttonsPressed.run ?
        Math.min(this.xVel + RUNNING_ACCELERATION, MAX_X_RUNNING_VELOCITY) :
        Math.min(this.xVel + WALKING_ACCELERATION, MAX_X_WALKING_VELOCITY)
    }



    if (this.xVel !== 0) {
      let overlapFound = false
      for (const rectangle of rectangles) {
        const newRectangleAfterX = {
          x: this.xPos + this.xVel,
          y: this.yPos,
          height: this.buttonsPressed.down ? HEIGHT_CROUCHING : HEIGHT,
          width: WIDTH,
        }

        if (isOverlapping(newRectangleAfterX, rectangle)) {
          if (this.xVel > 0) {
            this.xPos = rectangle.x - WIDTH
            console.log("x collision while moving right")
          } else {
            this.xPos = rectangle.x + rectangle.width
            console.log("x collision while moving left")
          }
          overlapFound = true
          this.xVel = 0
          break
        }
      }
      if (!overlapFound) {
        this.xPos += this.xVel
      }
    }

    if (this.yVel !== 0) {
      let overlapFound = false
      // console.log(rectangles)
      for (const rectangle of rectangles) {
        const newRectangleAfterY = {
          x: this.xPos,
          y: this.yPos + this.yVel,
          height: this.buttonsPressed.down ? HEIGHT_CROUCHING : HEIGHT,
          width: WIDTH,
        }

        if (isOverlapping(newRectangleAfterY, rectangle)) {
          if (this.yVel > 0) {
            this.yPos = rectangle.y - newRectangleAfterY.height
            // this.yPos = this.yPos + (rectangle.y - newRectangleAfterY.y - HEIGHT)
            this.currentJumpFrames = 0
            // console.log("y collision while moving down", rectangle.y, newRectangleAfterY.y, HEIGHT)
          } else {
            this.yPos = rectangle.y + rectangle.height
            // console.log("y collision while moving up")
          }
          overlapFound = true
          this.yVel = 0
          break
        }
      }

      // Jump initiate
      if (this.yVel === 0 && this.currentJumpFrames === 0 && this.buttonsPressed.jump && !this.holdingJump) {
        this.currentJumpFrames = 1
        this.holdingJump = true
      }


      if (!overlapFound) {
        this.yPos += this.yVel
      }
    }
  }

  private renderSprite() {
    // Change direction faced if necessary
    if (this.buttonsPressed.left) {
      this.spriteY = 0;
    }
    if (this.buttonsPressed.right) {
        this.spriteY = 1;
    }

    // Ducking
    if (this.buttonsPressed.down) {
        this.spriteX = 4;
    } else if (this.currentJumpFrames > 0) {
        // Jumping
        this.spriteX = 5;
    } else if (this.xVel != 0) {
        if ((this.xVel < 0 && this.buttonsPressed.right) || (this.xVel > 0 && this.buttonsPressed.left)) {
            // If facing the opposite direction of velocity
            this.spriteX = 5;
        } else {
            // Running
            var decrement = (Math.abs(this.xVel) > MAX_X_WALKING_VELOCITY) ? 2 : 1;
            if (this.framesLeft <= 0) {
                this.framesLeft = 15;
            }

            if (this.framesLeft > 11) {
                this.spriteX = 1;
            } else if (this.framesLeft > 7) {
                this.spriteX = 0;
            } else if (this.framesLeft > 3) {
                this.spriteX = 1;
            } else {
                this.spriteX = 2;
            }
            this.framesLeft -= decrement;
        }
    } else {
      // Standing still
      this.spriteX = 0
      this.framesLeft = 0
    }
    // console.log(this.framesLeft)

    this.node.children[0].x = -(this.spriteX * 16)
    this.node.children[0].y = -(this.spriteY * 16)
  }

  private render() {
    this.setCurrentPosition({x: this.xPos, y: this.yPos})
  }

  public nextFrame() {
    this.update()
    this.renderSprite()
    this.render()
    // console.info(this.xPos)
    // if (this.deathTimer !== null) {
    //   if (this.deathTimer > 100) {
    //     this.numLives--
    //     this.node.visible = true
    //     this.deathTimer = null
    //     this.newShip()
    //     return true
    //   }
    //   this.deathTimer++
    //   return false
    // }




    return true
  }
}

const BLOCKY_SVG = `<svg width="87" height="32" viewBox="0 0 87 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<g>
<path d="M5 15V9H6V16H4V15H5Z" fill="black"/>
<path d="M2 9V15H1V16H3V9H2Z" fill="black"/>
<path d="M1 31V25H0V32H2V31H1Z" fill="black"/>
<path d="M4 25V31H5V32H3V25H4Z" fill="black"/>
<rect x="1" y="1" width="4" height="7" fill="white"/>
<rect width="4" height="7" transform="matrix(-1 0 0 1 5 17)" fill="white"/>
<rect x="17" y="1" width="4" height="7" fill="white"/>
<rect width="4" height="7" transform="matrix(-1 0 0 1 21 17)" fill="white"/>
<rect x="33" y="1" width="4" height="7" fill="white"/>
<rect width="4" height="7" transform="matrix(-1 0 0 1 37 17)" fill="white"/>
<rect x="49" y="1" width="4" height="7" fill="white"/>
<rect width="4" height="7" transform="matrix(-1 0 0 1 53 17)" fill="white"/>
<rect x="65" y="1" width="4" height="5" fill="white"/>
<rect width="4" height="5" transform="matrix(-1 0 0 1 69 17)" fill="white"/>
<rect x="81" y="1" width="4" height="7" fill="white"/>
<rect width="4" height="7" transform="matrix(-1 0 0 1 86 17)" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M1 0V2H0V9H6V0H1ZM2 2V1H5V8H1V2H2ZM2 2V3H3V2H2Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5 16V18H6V25H0V16H5ZM4 18V17H1V24H5V18H4ZM4 18V19H3V18H4Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M17 0V2H16V9H22V0H17ZM18 2V1H21V8H17V2H18ZM18 2V3H19V2H18Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M21 16V18H22V25H16V16H21ZM20 18V17H17V24H21V18H20ZM20 18V19H19V18H20Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M33 0V2H32V9H38V0H33ZM34 2V1H37V8H33V2H34ZM34 2V3H35V2H34Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M37 16V18H38V25H32V16H37ZM36 18V17H33V24H37V18H36ZM36 18V19H35V18H36Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M49 0V2H48V9H54V0H49ZM50 2V1H53V8H49V2H50ZM50 2V3H51V2H50Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M53 16V18H54V25H48V16H53ZM52 18V17H49V24H53V18H52ZM52 18V19H51V18H52Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M65 0V2H64V7H70V0H65ZM66 2V1H69V6H65V2H66ZM66 2V3H67V2H66Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M69 16V18H70V23H64V16H69ZM68 18V17H65V22H69V18H68ZM68 18V19H67V18H68Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M81 0V2H80V9H86V0H81ZM82 2V1H85V8H81V2H82ZM82 2V3H83V2H82Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M86 16V18H87V25H81V16H86ZM85 18V17H82V24H86V18H85ZM85 18V19H84V18H85Z" fill="black"/>
<path d="M18 9H19V12H18V9Z" fill="black"/>
<path d="M17 12H18V15H17V12Z" fill="black"/>
<path d="M15 15H17V16H15V15Z" fill="black"/>
<path d="M21 9H22V13H21V9Z" fill="black"/>
<path d="M22 13H23V16H22V13Z" fill="black"/>
<path d="M21 15H22V16H21V15Z" fill="black"/>
<path d="M20 25H19V28H20V25Z" fill="black"/>
<path d="M21 28H20V31H21V28Z" fill="black"/>
<path d="M23 31H21V32H23V31Z" fill="black"/>
<path d="M17 25H16V29H17V25Z" fill="black"/>
<path d="M16 29H15V32H16V29Z" fill="black"/>
<path d="M17 31H16V32H17V31Z" fill="black"/>
<path d="M34 9H35V10H34V9Z" fill="black"/>
<path d="M33 10H34V12H33V10Z" fill="black"/>
<path d="M32 12H33V14H32V12Z" fill="black"/>
<path d="M37 9H38V11H37V9Z" fill="black"/>
<path d="M38 11H39V13H38V11Z" fill="black"/>
<path d="M40 13H39V15H38V16H40V13Z" fill="black"/>
<path d="M33 15V14H34V16H32V15H33Z" fill="black"/>
<path d="M36 25H35V26H36V25Z" fill="black"/>
<path d="M37 26H36V28H37V26Z" fill="black"/>
<path d="M38 28H37V30H38V28Z" fill="black"/>
<path d="M33 25H32V27H33V25Z" fill="black"/>
<path d="M32 27H31V29H32V27Z" fill="black"/>
<path d="M30 29H31V31H32V32H30V29Z" fill="black"/>
<path d="M37 31V30H36V32H38V31H37Z" fill="black"/>
<path d="M50 9H51V10H50V9Z" fill="black"/>
<path d="M49 10H50V12H49V10Z" fill="black"/>
<path d="M48 12H49V14H48V12Z" fill="black"/>
<path d="M53 9H54V11H53V9Z" fill="black"/>
<path d="M54 11H55V13H54V11Z" fill="black"/>
<path d="M56 13H55V15H54V16H56V13Z" fill="black"/>
<path d="M49 15V14H50V16H48V15H49Z" fill="black"/>
<path d="M52 25H51V26H52V25Z" fill="black"/>
<path d="M53 26H52V28H53V26Z" fill="black"/>
<path d="M54 28H53V30H54V28Z" fill="black"/>
<path d="M49 25H48V27H49V25Z" fill="black"/>
<path d="M48 27H47V29H48V27Z" fill="black"/>
<path d="M46 29H47V31H48V32H46V29Z" fill="black"/>
<path d="M53 31V30H52V32H54V31H53Z" fill="black"/>
<path d="M66 8V7H67V12H65V11H66V10H65V8H66Z" fill="black"/>
<path d="M69 8V7H70V12H68V11H69V10H68V8H69Z" fill="black"/>
<path d="M68 24V23H67V28H69V27H68V26H69V24H68Z" fill="black"/>
<path d="M65 24V23H64V28H66V27H65V26H66V24H65Z" fill="black"/>
<path d="M82 9H83V12H82V9Z" fill="black"/>
<path d="M83 15V12H84V16H82V15H83Z" fill="black"/>
<path d="M85 9H86V12H85V9Z" fill="black"/>
<path d="M86 15V12H87V16H85V15H86Z" fill="black"/>
<path d="M85 25H84V28H85V25Z" fill="black"/>
<path d="M84 31V28H83V32H85V31H84Z" fill="black"/>
<path d="M82 25H81V28H82V25Z" fill="black"/>
<path d="M81 31V28H80V32H82V31H81Z" fill="black"/>
</g>
</svg>
`