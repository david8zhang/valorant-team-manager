import { RoundConstants } from '~/utils/RoundConstants'
import { Screen } from '../TeamMgmt/Screen'
import { FirstTime } from './FirstTime'
import { Utilities } from '~/utils/Utilities'
import { HomePlayerInfo } from '~/core/ui/HomePlayerInfo'
import { Button } from '~/core/ui/Button'
import { PlayerAgentConfig } from '../TeamMgmt/TeamMgmt'

export class DraftStartingPlayersScreen implements Screen {
  private scene: FirstTime
  private headerText: Phaser.GameObjects.Text
  private starterPlayers: PlayerAgentConfig[] = []
  private playerCards: HomePlayerInfo[] = []
  private buttons: Button[] = []
  private nextButton!: Button

  constructor(scene: FirstTime) {
    this.scene = scene
    this.headerText = this.scene.add.text(30, 30, 'Pick your starters', {
      fontSize: '30px',
      color: 'black',
    })
    this.generateStarterPlayers()
    this.setupOrUpdateStarterPlayerCards()
    this.setupNextButton()
    this.setVisible(false)
  }

  generateStarterPlayers() {
    this.starterPlayers = Utilities.generateNewPlayers(this.scene.teamName, 4)
  }

  setupNextButton() {
    this.nextButton = new Button({
      scene: this.scene,
      onClick: () => {
        this.scene.initializeNewGameData()
      },
      text: 'Next',
      width: 150,
      height: 40,
      x: RoundConstants.WINDOW_WIDTH - 90,
      y: RoundConstants.WINDOW_HEIGHT - 40,
      strokeColor: 0x000000,
      textColor: 'black',
      strokeWidth: 1,
      fontSize: '15px',
    })
    this.updateNextButton()
  }

  updateNextButton() {
    this.nextButton.setVisible(this.scene.selectedPlayers.length == 3)
  }

  setupOrUpdateStarterPlayerCards() {
    if (this.playerCards.length > 0) {
      this.playerCards.forEach((card) => {
        card.destroy()
      })
      this.buttons.forEach((button) => {
        button.destroy()
      })
      this.playerCards = []
      this.buttons = []
    }
    const numStarters = this.starterPlayers.length
    const padding = 15
    const cardWidth =
      RoundConstants.WINDOW_WIDTH / numStarters - padding * ((numStarters + 1) / numStarters)
    const cardHeight = RoundConstants.WINDOW_HEIGHT - 240
    let xPos = padding
    const selectedPlayerIds = new Set(
      this.scene.selectedPlayers.map((playerConfig) => playerConfig.id)
    )
    this.starterPlayers.forEach((config) => {
      const rankEnum = Utilities.getOverallPlayerRank(config)
      const ovrRankText = Utilities.getRankNameForEnum(rankEnum)
      const isSelected = selectedPlayerIds.has(config.id)
      const buttonGrayedDueToMaxStarters =
        !isSelected && this.scene.selectedPlayers.length === RoundConstants.NUM_STARTERS
      const playerCard = new HomePlayerInfo(this.scene, {
        name: config.name,
        position: {
          x: xPos,
          y: padding + 75,
        },
        height: cardHeight,
        width: cardWidth,
        bgColor: isSelected ? 0x2ecc71 : 0xffffff,
        ovrRank: ovrRankText,
      })
      const selectButton = new Button({
        text: buttonGrayedDueToMaxStarters
          ? 'Only 3 Starters Allowed'
          : isSelected
          ? 'Unselect'
          : 'Select',
        onClick: () => {
          if (!buttonGrayedDueToMaxStarters) {
            if (isSelected) {
              this.scene.selectedPlayers = this.scene.selectedPlayers.filter(
                (p) => p.id !== config.id
              )
            } else {
              this.scene.selectedPlayers.push(config)
            }
            this.setupOrUpdateStarterPlayerCards()
            this.updateNextButton()
          }
        },
        x: xPos + playerCard.rectangle.displayWidth / 2,
        y: playerCard.rectangle.y + playerCard.rectangle.displayHeight + 35,
        width: playerCard.rectangle.displayWidth,
        height: 50,
        scene: this.scene,
        strokeColor: 0x000000,
        strokeWidth: 1,
        backgroundColor: buttonGrayedDueToMaxStarters ? 0xdddddd : 0xffffff,
      })
      this.playerCards.push(playerCard)
      this.buttons.push(selectButton)
      xPos += cardWidth + padding
    })
  }

  onRender(data?: any): void {}
  setVisible(isVisible: boolean): void {
    this.playerCards.forEach((card) => {
      card.setVisible(isVisible)
    })
    this.buttons.forEach((button) => {
      button.setVisible(isVisible)
    })
    this.headerText.setVisible(isVisible)
    if (!isVisible) {
      this.nextButton.setVisible(isVisible)
    }
  }
}
