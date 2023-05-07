import { RoundConstants } from '~/utils/RoundConstants'
import { PostRound } from '../../PostRound'
import { Screen } from '../Screen'
import TeamMgmt from '~/scenes/TeamMgmt'
import { PostRoundPlayerExp } from '~/core/ui/PostRoundPlayerExp'
import {
  PLAYER_POTENTIAL_TO_EXP_MAPPING,
  PlayerAttributes,
  PlayerRank,
} from '~/utils/PlayerConstants'
import { Side } from '~/core/Agent'

export interface PlayerStatGrowthConfig {
  curr: number
  max: number
  gain: number
  oldRank: PlayerRank
  newRank: PlayerRank
}

export class PostRoundPlayerExpScreen implements Screen {
  private scene: PostRound
  private titleText: Phaser.GameObjects.Text
  private playerExpCards: PostRoundPlayerExp[] = []
  private playerExpGrowthMapping: {
    [key: string]: {
      [key in PlayerAttributes]?: PlayerStatGrowthConfig
    }
  } = {}

  // Static constants
  private static ROUND_WIN_EXP_MODIFIER = 2
  private static MVP_EXP_MODIFIER = 1.5

  constructor(scene: PostRound) {
    this.scene = scene
    this.titleText = this.scene.add.text(RoundConstants.WINDOW_WIDTH / 2, 30, 'Post Round', {
      fontSize: '30px',
      color: 'black',
    })
    this.titleText.setPosition(
      RoundConstants.WINDOW_WIDTH / 2 - this.titleText.displayWidth / 2,
      this.titleText.y + 10
    )
    this.createPlayerExpGrowthMapping()
    this.setupPlayerExpCards()
    this.setVisible(false)
  }

  setVisible(isVisible: boolean) {
    this.titleText.setVisible(isVisible)
    this.playerExpCards.forEach((card) => {
      card.setVisible(isVisible)
    })
  }

  createPlayerExpGrowthMapping() {
    const playerConfigs = this.scene.playerTeamConfig.roster
    const playerStats = this.scene.playerStats

    playerConfigs.forEach((config) => {
      const expRange = PLAYER_POTENTIAL_TO_EXP_MAPPING[config.potential]
      Object.keys(config.attributes).forEach((key) => {
        const attr = key as PlayerAttributes
        let expGainAmt = Phaser.Math.Between(expRange.low, expRange.high)
        if (this.scene.winningSide === Side.PLAYER) {
          expGainAmt *= PostRoundPlayerExpScreen.ROUND_WIN_EXP_MODIFIER
        }
        if (playerStats[config.name].matchMvp || playerStats[config.name].teamMvp) {
          expGainAmt = Math.round(expGainAmt * PostRoundPlayerExpScreen.MVP_EXP_MODIFIER)
        }

        // PlayerRank maps to a number (Bronze = 0, Silver = 1, etc.). EXP gain rate is log base 2
        const maxExpAmount = 100 * Math.pow(2, config.attributes[attr])
        if (!this.playerExpGrowthMapping[config.name]) {
          this.playerExpGrowthMapping[config.name] = {}
        }
        this.playerExpGrowthMapping[config.name][attr] = {
          curr: config.experience[attr],
          max: maxExpAmount,
          gain: expGainAmt,
          oldRank: config.attributes[attr],
          newRank:
            config.experience[attr] + expGainAmt >= maxExpAmount
              ? config.attributes[attr] + 1
              : config.attributes[attr],
        }
      })
    })
  }

  onRender() {}

  setupPlayerExpCards() {
    const padding = 15
    const playerConfigs = Object.keys(this.scene.playerStats).map((key) => {
      return {
        ...this.scene.playerStats[key],
        name: key,
      }
    })
    // Calculate card widths and layout
    const cardWidth =
      TeamMgmt.BODY_WIDTH / playerConfigs.length -
      padding * ((playerConfigs.length + 1) / playerConfigs.length)
    let xPos =
      RoundConstants.WINDOW_WIDTH / 2 -
      (cardWidth * playerConfigs.length + (padding * playerConfigs.length - 1)) / 2 +
      7

    console.log(this.playerExpGrowthMapping)

    playerConfigs.forEach((config) => {
      const growthConfig = this.playerExpGrowthMapping[config.name]
      this.playerExpCards.push(
        new PostRoundPlayerExp(this.scene, {
          name: config.name,
          position: {
            x: xPos,
            y: padding + 80,
          },
          height: RoundConstants.WINDOW_HEIGHT - 200,
          width: cardWidth,
          exp: growthConfig,
        })
      )
      xPos += cardWidth + padding
    })
  }
}
