import Game from '~/scenes/Game'

export class Player {
  public game: Game
  constructor() {
    this.game = Game.instance
    this.game.input.on(Phaser.Input.Events.POINTER_DOWN, (e) => {
      const endPos = this.game.getTilePosForWorldPos(e.worldX, e.worldY)
      const agent = this.game.playerAgents[0]
      const agentTilePos = this.game.getTilePosForWorldPos(agent.sprite.x, agent.sprite.y)
      this.game.pathfinding.getPath(agentTilePos, endPos)
    })
  }
}
