import Game from '~/scenes/Game'

export class Player {
  public game: Game
  public cursorRect!: Phaser.GameObjects.Rectangle

  constructor() {
    this.game = Game.instance
    this.setupCursor()
    this.game.input.on(Phaser.Input.Events.POINTER_DOWN, (e) => {
      const agent = this.game.playerAgents[0]
      agent.moveToLocation(e.worldX, e.worldY)
    })

    this.game.input.on(Phaser.Input.Events.POINTER_MOVE, (e) => {
      this.updateCursor()
    })
  }

  updateCursor() {
    const mousePointer = this.game.input.mousePointer
    const tilePos = this.game.getTilePosForWorldPos(mousePointer.worldX, mousePointer.worldY)
    const tileCenter = this.game.getWorldPosForTilePos(tilePos.row, tilePos.col)
    const tile = this.game.getTileAt(mousePointer.worldX, mousePointer.worldY)

    this.cursorRect.setPosition(tileCenter.x, tileCenter.y)
    if (tile.index === 1) {
      this.cursorRect.setStrokeStyle(2, 0xff0000)
    } else {
      this.cursorRect.setStrokeStyle(2, 0x00ff00)
    }
  }

  setupCursor() {
    const mousePointer = this.game.input.mousePointer
    const tilePos = this.game.getTilePosForWorldPos(mousePointer.worldX, mousePointer.worldY)
    const tileCenter = this.game.getWorldPosForTilePos(tilePos.row, tilePos.col)
    this.cursorRect = this.game.add.rectangle(tileCenter.x, tileCenter.y, 16, 16)
    this.cursorRect.setStrokeStyle(2, 0x00ff00).setDepth(100)
  }
}
