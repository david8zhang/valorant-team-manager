import Game from '~/scenes/Game'
import { Agent, Side } from './Agent'
import { States } from './states/States'

export class CPU {
  public game: Game
  public agents: Agent[] = []

  constructor() {
    this.game = Game.instance
    this.createAgents()
    this.setupDebugListener()
  }

  setupDebugListener() {
    this.game.debugHandlers.push((isDebug) => {
      this.agents.forEach((agent) => {
        if (isDebug) {
          agent.sprite.setVisible(true)
          agent.healthBar.setVisible(true)
          agent.hideSightCones = false
        } else {
          agent.sprite.setVisible(false)
          agent.healthBar.setVisible(false)
          agent.hideSightCones = true
        }
      })
    })
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
        name: `cpu-${i}`,
        texture: 'cpu-agent',
        sightAngleDeg: 270,
        hideSightCones: true,
        raycaster: this.game.cpuRaycaster,
        side: Side.CPU,
      })
      newAgent.sprite.setVisible(false)
      this.agents.push(newAgent)
      startX += newAgent.sprite.displayWidth + 20
    }
  }

  update() {
    this.agents.forEach((agent) => {
      if (!this.game.isDebug) {
        agent.sprite.setVisible(false)
        agent.healthBar.setVisible(false)
      }
      agent.update()
    })
  }
}
