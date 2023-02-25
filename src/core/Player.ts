import Game from '~/scenes/Game'

export class Player {
  public game: Game
  constructor() {
    this.game = Game.instance
    this.game.input.on(Phaser.Input.Events.POINTER_DOWN, (e) => {
      const agent = this.game.playerAgents[0]
      agent.moveToLocation(e.worldX, e.worldY)
    })
  }
}
