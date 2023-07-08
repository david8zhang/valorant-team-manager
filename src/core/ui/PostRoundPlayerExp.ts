import { PostRound } from '~/scenes/PostRound/PostRound'
import { PlayerStatGrowthConfig } from '~/scenes/PostRound/PostRoundPlayerExpScreen'
import { PLAYER_ATTRIBUTE_ABBREV, PlayerAttributes, PlayerRank } from '~/utils/PlayerConstants'
import { UIValueBar } from './UIValueBar'
import { RoundConstants } from '~/utils/RoundConstants'

export interface PostRoundPlayerExpConfig {
  position: {
    x: number
    y: number
  }
  width: number
  height: number
  name: string
  exp: {
    [key in PlayerAttributes]?: PlayerStatGrowthConfig
  }
}

export class PostRoundPlayerExp {
  private scene: PostRound
  private rectangle: Phaser.GameObjects.Rectangle
  private playerNameText: Phaser.GameObjects.Text
  private attributeGroup: Phaser.GameObjects.Group
  private config: PostRoundPlayerExpConfig
  private rankUpMessage: Phaser.GameObjects.Text

  constructor(scene: PostRound, config: PostRoundPlayerExpConfig) {
    this.scene = scene
    this.rectangle = this.scene.add
      .rectangle(config.position.x, config.position.y, config.width, config.height)
      .setStrokeStyle(1, 0x000000)
      .setOrigin(0)
    this.playerNameText = this.scene.add
      .text(this.rectangle.x, this.rectangle.y, config.name, {
        fontSize: '24px',
        color: 'black',
      })
      .setWordWrapWidth(this.rectangle.displayWidth - 30, true)
      .setAlign('center')

    let yPos = this.rectangle.y + 200
    this.playerNameText.setPosition(
      this.rectangle.x + this.rectangle.displayWidth / 2 - this.playerNameText.displayWidth / 2,
      yPos - this.playerNameText.displayHeight / 2
    )
    this.rankUpMessage = this.scene.add
      .text(this.rectangle.x, this.playerNameText.y + 100, 'Rank up!', {
        fontSize: '20px',
        color: 'black',
      })
      .setAlpha(0)

    this.attributeGroup = this.scene.add.group()
    this.config = config
  }

  onRender() {
    this.setupAttributeExpBars(this.config)
  }

  setupAttributeExpBars(config: PostRoundPlayerExpConfig) {
    const expGrowthConfigs = config.exp
    let yPos = this.rectangle.y + 250
    Object.keys(expGrowthConfigs).forEach((key, index) => {
      const attribute = key as PlayerAttributes
      const attrText = this.scene.add
        .text(this.rectangle.x + 15, yPos, PLAYER_ATTRIBUTE_ABBREV[attribute], {
          fontSize: '15px',
          color: 'black',
        })
        .setOrigin(0)
      const progressBar = new UIValueBar(this.scene, {
        x: this.rectangle.x + this.rectangle.displayWidth - 115,
        y: yPos + 2,
        width: 80,
        height: 10,
        maxValue: config.exp[attribute]!.max,
        borderWidth: 0,
      })
      progressBar.setCurrValue(config.exp[attribute]!.curr)
      yPos += attrText.displayHeight + 15
      const increaseText = this.scene.add
        .text(progressBar.x + 40, progressBar.y, `+${config.exp[attribute]!.gain}`, {
          fontSize: '10px',
          color: 'white',
        })
        .setDepth(RoundConstants.SORT_LAYERS.UI)
      increaseText.setPosition(increaseText.x - increaseText.displayWidth / 2, increaseText.y)
      this.attributeGroup.add(attrText)
      this.attributeGroup.add(progressBar.bar)
      this.attributeGroup.add(increaseText)
      const completeCb =
        index === Object.keys(config.exp).length - 1
          ? () => {
              if (this.didOverallRankIncrease(config.exp)) {
                this.showRankUpMessage()
              }
            }
          : null
      this.tweenHealthBarIncrease(progressBar, config.exp[attribute]!, increaseText, completeCb)
    })
  }

  showRankUpMessage() {
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.attributeGroup.setVisible(false)
        this.scene.tweens.add({
          targets: [this.rankUpMessage],
          duration: 250,
          onUpdate: () => {
            this.rankUpMessage.setPosition(
              this.rectangle.x +
                this.rectangle.displayWidth / 2 -
                this.rankUpMessage.displayWidth / 2,
              this.rankUpMessage.y
            )
          },
          ease: Phaser.Math.Easing.Sine.InOut,
          alpha: {
            from: 0,
            to: 1,
          },
          scale: {
            from: 1.5,
            to: 1,
          },
        })
      },
    })
  }

  didOverallRankIncrease(config: {
    [key in PlayerAttributes]?: PlayerStatGrowthConfig
  }) {
    const oldOverallRank = Math.round(
      Object.values(config).reduce((acc, curr) => {
        return (acc += curr.oldRank)
      }, 0) / Object.keys(config).length
    )
    const newOverallRank = Math.round(
      Object.values(config).reduce((acc, curr) => {
        return (acc += curr.newRank)
      }, 0) / Object.keys(config).length
    )
    return newOverallRank !== oldOverallRank
  }

  tweenHealthBarIncrease(
    progressBar: UIValueBar,
    expGain: PlayerStatGrowthConfig,
    increaseText: Phaser.GameObjects.Text,
    onCompleteCallback?: Function | null
  ) {
    const gain = expGain.gain
    const event = this.scene.time.addEvent({
      delay: 25,
      callback: () => {
        if (progressBar.currValue + gain / 10 > expGain.max) {
          progressBar.setCurrValue((progressBar.currValue + gain / 10) % expGain.max)
          progressBar.setMaxValue(100 * Math.pow(2, expGain.newRank))
          increaseText.setText('Rank Up!')
          increaseText.setPosition(
            progressBar.x + 40 - increaseText.displayWidth / 2,
            increaseText.y
          )
        } else {
          progressBar.setCurrValue(progressBar.currValue + gain / 10)
        }
        if (event.getOverallProgress() === 1) {
          progressBar.setCurrValue(Math.round(progressBar.currValue))
          if (onCompleteCallback) {
            onCompleteCallback()
          }
        }
      },
      repeat: 9,
    })
  }

  setVisible(isVisible: boolean) {
    this.rectangle.setVisible(isVisible)
    this.playerNameText.setVisible(isVisible)
    this.attributeGroup.setVisible(isVisible)
  }
}
