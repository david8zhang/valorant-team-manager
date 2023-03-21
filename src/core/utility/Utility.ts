import Game from '~/scenes/Game'
import { Agent, Side } from '../Agent'
import { UtilityKey } from './UtilityKey'
import { UtilityName } from './UtilityNames'

export interface UtilityConfig {
  key: UtilityKey
  name: UtilityName
  texture: string
  agent: Agent
}

export abstract class Utility {
  public key: UtilityKey
  public name: UtilityName
  public texture: string
  public game: Game
  public agent: Agent

  constructor(game: Game, config: UtilityConfig) {
    this.game = game
    this.key = config.key
    this.texture = config.texture
    this.agent = config.agent
    this.name = config.name
  }

  public abstract deselect(): void
  public abstract reset(): void
  public abstract use(...args: any): void
}
