import TeamMgmt, { PlayerAgentConfig } from '~/scenes/TeamMgmt/TeamMgmt'
import { PlayerDrilldownAttrRow } from '../components/PlayerDrilldownAttrRow'
import {
  PlayerAttributes,
  RANK_TO_ACCURACY_MAPPING,
  RANK_TO_HS_MAPPING,
  RANK_TO_REACTION_MAPPING,
} from '~/utils/PlayerConstants'

export interface PlayerAttributesTabConfig {
  position: {
    x: number
    y: number
  }
  playerConfig: PlayerAgentConfig
}

export class PlayerAttributesTab {
  private scene: TeamMgmt
  private playerConfig: PlayerAgentConfig
  private accuracyRow!: PlayerDrilldownAttrRow
  private reactionRow!: PlayerDrilldownAttrRow
  private headshotRow!: PlayerDrilldownAttrRow
  private position: {
    x: number
    y: number
  }

  constructor(scene: TeamMgmt, config: PlayerAttributesTabConfig) {
    this.scene = scene
    this.playerConfig = config.playerConfig
    this.position = config.position
    this.setupAttributeRows(config)
  }

  updatePlayerConfig(playerConfig: PlayerAgentConfig) {
    this.playerConfig = playerConfig
    this.accuracyRow.updateConfig({
      name: 'Accuracy',
      value: `${
        RANK_TO_ACCURACY_MAPPING[this.playerConfig.attributes[PlayerAttributes.ACCURACY]]
      }%`,
      rank: this.playerConfig.attributes[PlayerAttributes.ACCURACY],
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      exp: {
        currValue: this.playerConfig.experience[PlayerAttributes.ACCURACY],
        maxValue: 100 * Math.pow(2, this.playerConfig.attributes[PlayerAttributes.ACCURACY]),
      },
    })
    this.reactionRow.updateConfig({
      name: 'Reaction',
      value: `${
        RANK_TO_REACTION_MAPPING[this.playerConfig.attributes[PlayerAttributes.REACTION]]
      }ms`,
      rank: this.playerConfig.attributes[PlayerAttributes.REACTION],
      position: {
        x: this.position.x,
        y: this.position.y + 50,
      },
      exp: {
        currValue: this.playerConfig.experience[PlayerAttributes.REACTION],
        maxValue: 100 * Math.pow(2, this.playerConfig.attributes[PlayerAttributes.REACTION]),
      },
    })
    this.headshotRow.updateConfig({
      name: 'Headshot',
      value: `${RANK_TO_HS_MAPPING[this.playerConfig.attributes[PlayerAttributes.HEADSHOT]]}%`,
      rank: this.playerConfig.attributes[PlayerAttributes.HEADSHOT],
      position: {
        x: this.position.x,
        y: this.position.y + 100,
      },
      exp: {
        currValue: this.playerConfig.experience[PlayerAttributes.HEADSHOT],
        maxValue: 100 * Math.pow(2, this.playerConfig.attributes[PlayerAttributes.HEADSHOT]),
      },
    })
  }

  setupAttributeRows(config: PlayerAttributesTabConfig) {
    this.accuracyRow = new PlayerDrilldownAttrRow(this.scene, {
      name: 'Accuracy',
      value: `${
        RANK_TO_ACCURACY_MAPPING[this.playerConfig.attributes[PlayerAttributes.ACCURACY]]
      }%`,
      rank: this.playerConfig.attributes[PlayerAttributes.ACCURACY],
      position: {
        x: config.position.x,
        y: config.position.y,
      },
      exp: {
        currValue: this.playerConfig.experience[PlayerAttributes.ACCURACY],
        maxValue: 100 * Math.pow(2, this.playerConfig.attributes[PlayerAttributes.ACCURACY]),
      },
    })
    this.reactionRow = new PlayerDrilldownAttrRow(this.scene, {
      name: 'Reaction',
      value: `${
        RANK_TO_REACTION_MAPPING[this.playerConfig.attributes[PlayerAttributes.REACTION]]
      }ms`,
      rank: this.playerConfig.attributes[PlayerAttributes.REACTION],
      position: {
        x: config.position.x,
        y: config.position.y + 50,
      },
      exp: {
        currValue: this.playerConfig.experience[PlayerAttributes.REACTION],
        maxValue: 100 * Math.pow(2, this.playerConfig.attributes[PlayerAttributes.REACTION]),
      },
    })

    this.headshotRow = new PlayerDrilldownAttrRow(this.scene, {
      name: 'Headshot',
      value: `${RANK_TO_HS_MAPPING[this.playerConfig.attributes[PlayerAttributes.HEADSHOT]]}%`,
      rank: this.playerConfig.attributes[PlayerAttributes.HEADSHOT],
      position: {
        x: config.position.x,
        y: config.position.y + 100,
      },
      exp: {
        currValue: this.playerConfig.experience[PlayerAttributes.HEADSHOT],
        maxValue: 100 * Math.pow(2, this.playerConfig.attributes[PlayerAttributes.HEADSHOT]),
      },
    })
  }

  setVisible(isVisible: boolean) {
    this.accuracyRow.setVisible(isVisible)
    this.headshotRow.setVisible(isVisible)
    this.reactionRow.setVisible(isVisible)
  }
}
