import TeamMgmt, { PlayerAgentConfig } from '~/scenes/TeamMgmt/TeamMgmt'
import { Screen } from '../../Screen'
import { Utilities } from '~/utils/Utilities'
import { RoundConstants } from '~/utils/RoundConstants'
import { Save, SaveKeys } from '~/utils/Save'
import { PlayerAttributes } from '~/utils/PlayerConstants'
import { GenericPlayerAttrRow } from '~/core/ui/GenericPlayerAttrRow'
import { ScreenKeys } from '../../ScreenKeys'
import { ContractDrilldownScreenConfig } from '../Contracts/ContractDrilldownScreen'

export class FreeAgentScreen implements Screen {
  private static PAGE_SIZE = 10

  private titleText!: Phaser.GameObjects.Text
  private freeAgentRows: GenericPlayerAttrRow[] = []
  private scene: TeamMgmt
  private leftButton!: Phaser.GameObjects.Image
  private rightButton!: Phaser.GameObjects.Image
  private currPageIndex: number = 0

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.titleText = this.scene.add
      .text(RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15, 15, 'Free Agents', {
        fontSize: '25px',
        color: 'black',
      })
      .setOrigin(0)
    this.setupPaginationButtons()
    this.setVisible(false)
  }

  onRender(data?: any): void {
    this.updateFreeAgentPage(0)
  }

  hideOrDisplayPaginationButtons() {
    if (this.leftButton && this.rightButton) {
      const freeAgents = this.loadSavedFreeAgents()
      this.leftButton.setVisible(true)
      this.rightButton.setVisible(true)
      if (this.currPageIndex === 0) {
        this.leftButton.setVisible(false)
      }
      const lastPageIndex = Math.round(freeAgents.length / FreeAgentScreen.PAGE_SIZE) - 1
      if (this.currPageIndex === lastPageIndex) {
        this.rightButton.setVisible(false)
      }
    }
  }

  setVisible(isVisible: boolean): void {
    this.titleText.setVisible(isVisible)
    this.leftButton.setVisible(isVisible)
    this.rightButton.setVisible(isVisible)
    this.freeAgentRows.forEach((row) => {
      row.setVisible(isVisible)
    })
  }

  setupPaginationButtons() {
    this.leftButton = this.scene.add
      .image(
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 20,
        RoundConstants.WINDOW_HEIGHT - 20,
        'backward'
      )
      .setScale(0.5)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.leftButton.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
        this.updateFreeAgentPage(-1)
        this.leftButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.updateFreeAgentPage(-1)
        this.leftButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.updateFreeAgentPage(-1)
        this.leftButton.setAlpha(1)
      })

    this.rightButton = this.scene.add
      .image(RoundConstants.WINDOW_WIDTH - 20, RoundConstants.WINDOW_HEIGHT - 20, 'forward')
      .setScale(0.5)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.rightButton.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
        this.updateFreeAgentPage(1)
        this.rightButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.updateFreeAgentPage(1)
        this.rightButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.updateFreeAgentPage(1)
        this.rightButton.setAlpha(1)
      })
  }

  loadSavedFreeAgents() {
    const savedFreeAgents = Save.getData(SaveKeys.FREE_AGENTS) as PlayerAgentConfig[]
    return savedFreeAgents ? savedFreeAgents : []
  }

  updateFreeAgentPage(diff: number) {
    const freeAgents = this.loadSavedFreeAgents()
    this.currPageIndex += diff
    this.currPageIndex = Math.max(0, this.currPageIndex)
    if (freeAgents.length > 0) {
      this.currPageIndex = Math.min(
        Math.ceil(freeAgents.length / FreeAgentScreen.PAGE_SIZE) - 1,
        this.currPageIndex
      )
    }

    this.hideOrDisplayPaginationButtons()
    if (this.freeAgentRows.length > 0) {
      this.freeAgentRows.forEach((row) => {
        row.destroy()
      })
      this.freeAgentRows = []
    }

    let yPos = this.titleText.y + this.titleText.displayHeight + 100
    const freeAgentsPage = freeAgents.slice(
      this.currPageIndex * FreeAgentScreen.PAGE_SIZE,
      this.currPageIndex * FreeAgentScreen.PAGE_SIZE + FreeAgentScreen.PAGE_SIZE
    )
    freeAgentsPage.forEach((freeAgentConfig: PlayerAgentConfig, index: number) => {
      const attributes = freeAgentConfig.attributes
      const overall = Utilities.getOverallPlayerRank(freeAgentConfig)
      const newProspectRow = new GenericPlayerAttrRow(this.scene, {
        name: freeAgentConfig.name,
        showName: true,
        columnFontStyle: {
          fontSize: '15px',
          color: 'black',
        },
        position: {
          x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
          y: yPos,
        },
        isHeader: index == 0,
        columnConfigs: [
          {
            key: 'Acc.',
            value: Utilities.getAbbrevRankNameForEnum(attributes[PlayerAttributes.ACCURACY]),
          },
          {
            key: 'HS.',
            value: Utilities.getAbbrevRankNameForEnum(attributes[PlayerAttributes.HEADSHOT]),
          },
          {
            key: 'React.',
            value: Utilities.getAbbrevRankNameForEnum(attributes[PlayerAttributes.REACTION]),
          },
          {
            key: 'OVR',
            value: Utilities.getAbbrevRankNameForEnum(overall),
          },
          {
            key: 'Pot.',
            value: `${freeAgentConfig.potential}`,
          },
          {
            key: 'Sign',
            buttonConfig: {
              text: 'Sign',
              onClick: () => {
                const data: ContractDrilldownScreenConfig = {
                  playerConfig: freeAgentConfig,
                  isFreeAgentSigning: true,
                  onCancelFn: () => {
                    this.scene.renderActiveScreen(ScreenKeys.FREE_AGENTS)
                  },
                }
                this.scene.renderActiveScreen(ScreenKeys.CONTRACT_DRILLDOWN, data)
              },
            },
          },
        ],
      })
      this.freeAgentRows.push(newProspectRow)
      yPos += 35
    })
  }
}
