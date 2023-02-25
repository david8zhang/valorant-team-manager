import Game from '~/scenes/Game'
import { Agent } from './Agent'

export class CPU {
  public game: Game
  public agents: Agent[] = []

  constructor() {
    this.game = Game.instance
    this.createAgents()
  }

  createAgents() {
    let startX = 280
    let startY = 460
    for (let i = 1; i <= 3; i++) {
      const newAgent = new Agent({
        position: {
          x: startX,
          y: startY,
        },
        texture: 'cpu-agent',
        sightAngleDeg: 270,
        hideSightCones: true,
        raycaster: this.game.cpuRaycaster,
      })
      newAgent.sprite.setVisible(false)
      this.agents.push(newAgent)
      startX += newAgent.sprite.displayWidth + 20
    }
  }

  update() {
    this.agents.forEach((agent) => {
      agent.sprite.setVisible(false)
      agent.update()
    })
  }
}
