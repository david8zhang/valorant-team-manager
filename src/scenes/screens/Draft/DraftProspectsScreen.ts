import { Screen } from '../Screen'
import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '../../TeamMgmt'
import { Save, SaveKeys } from '~/utils/Save'
import { MINIMUM_CONTRACT, PlayerAttributes, PlayerRank } from '~/utils/PlayerConstants'
import { RoundConstants } from '~/utils/RoundConstants'
import { Utilities } from '~/utils/Utilities'
import { ScreenKeys } from '../ScreenKeys'
import { GenericPlayerAttrRow } from '~/core/ui/GenericPlayerAttrRow'

export class DraftProspectsScreen implements Screen {
  public static PAGE_SIZE = 10
  public static NUM_DRAFT_PROSPECTS = 64

  private scene: TeamMgmt
  private titleText: Phaser.GameObjects.Text
  private currPageIndex: number = 0
  public draftProspectRows: GenericPlayerAttrRow[] = []
  private leftButton!: Phaser.GameObjects.Image
  private rightButton!: Phaser.GameObjects.Image
  private scoutPointsText!: Phaser.GameObjects.Text

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.titleText = this.scene.add
      .text(RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15, 15, 'Draft Prospects', {
        fontSize: '25px',
        color: 'black',
      })
      .setOrigin(0)
    this.setupScoutPointsText()
    this.setupPaginationButtons()
    this.setVisible(false)
  }

  setupScoutPointsText() {
    let scoutPoints = Save.getData(SaveKeys.SCOUT_POINTS) as number
    if (scoutPoints === undefined) {
      Save.setData(SaveKeys.SCOUT_POINTS, RoundConstants.DEFAULT_SCOUT_POINTS)
      scoutPoints = RoundConstants.DEFAULT_SCOUT_POINTS
    }
    this.scoutPointsText = this.scene.add
      .text(
        this.titleText.x,
        this.titleText.y + this.titleText.displayHeight + 15,
        `Scout Points: ${scoutPoints}`,
        {
          fontSize: '18px',
          color: 'black',
        }
      )
      .setOrigin(0)
  }

  loadSavedDraftProspects() {
    let savedDraftProspects = Save.getData(SaveKeys.DRAFT_PROSPECTS) as PlayerAgentConfig[]
    if (!savedDraftProspects) {
      savedDraftProspects = this.generateDraftProspects().sort((a, b) => {
        return Utilities.getOverallPlayerRank(b) - Utilities.getOverallPlayerRank(a)
      })
      Save.setData(SaveKeys.DRAFT_PROSPECTS, savedDraftProspects)
    }
    return savedDraftProspects
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
        this.updateDraftPage(-1)
        this.leftButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.updateDraftPage(-1)
        this.leftButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.updateDraftPage(-1)
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
        this.updateDraftPage(1)
        this.rightButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.updateDraftPage(1)
        this.rightButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.updateDraftPage(1)
        this.rightButton.setAlpha(1)
      })
  }

  updateDraftPage(diff: number) {
    const draftProspects = this.loadSavedDraftProspects()
    this.currPageIndex += diff
    this.currPageIndex = Math.max(0, this.currPageIndex)
    this.currPageIndex = Math.min(
      draftProspects.length / DraftProspectsScreen.PAGE_SIZE - 1,
      this.currPageIndex
    )

    if (this.leftButton && this.rightButton) {
      this.leftButton.setVisible(true)
      this.rightButton.setVisible(true)
      if (this.currPageIndex === 0) {
        this.leftButton.setVisible(false)
      }
      const lastPageIndex = draftProspects.length / DraftProspectsScreen.PAGE_SIZE - 1
      if (this.currPageIndex === lastPageIndex) {
        this.rightButton.setVisible(false)
      }
    }

    if (this.draftProspectRows.length > 0) {
      this.draftProspectRows.forEach((row) => {
        row.destroy()
      })
      this.draftProspectRows = []
    }

    let yPos = this.titleText.y + this.titleText.displayHeight + 100
    const draftProspectsPage = draftProspects.slice(
      this.currPageIndex * DraftProspectsScreen.PAGE_SIZE,
      this.currPageIndex * DraftProspectsScreen.PAGE_SIZE + DraftProspectsScreen.PAGE_SIZE
    )
    const scoutedDraftIds = (Save.getData(SaveKeys.SCOUTED_PROSPECT_IDS) as string[]) || []
    draftProspectsPage.forEach((prospectConfig: PlayerAgentConfig, index: number) => {
      const attributes = prospectConfig.attributes
      const isScouted = scoutedDraftIds.includes(prospectConfig.id)
      const overall = Utilities.getOverallPlayerRank(prospectConfig)
      const newProspectRow = new GenericPlayerAttrRow(this.scene, {
        name: prospectConfig.name,
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
            value: isScouted ? `${prospectConfig.potential}` : undefined,
            buttonConfig: isScouted
              ? undefined
              : {
                  text: 'Scout',
                  onClick: () => {
                    const numScoutPoints = Save.getData(SaveKeys.SCOUT_POINTS)
                    if (numScoutPoints > 0) {
                      this.onScout(prospectConfig.id)
                    }
                  },
                },
          },
          {
            key: 'Draft',
            buttonConfig: {
              text: 'Draft',
              onClick: () => {
                this.onDraft(prospectConfig)
              },
            },
          },
        ],
      })
      this.draftProspectRows.push(newProspectRow)
      yPos += 35
    })
  }

  onScout(playerId: string) {
    const numScoutPoints = Save.getData(SaveKeys.SCOUT_POINTS)
    Save.setData(SaveKeys.SCOUT_POINTS, numScoutPoints - 1)
    this.scoutPointsText.setText(`Scout Points: ${numScoutPoints - 1}`)
    let scoutedIds = Save.getData(SaveKeys.SCOUTED_PROSPECT_IDS) as string[]
    if (!scoutedIds) {
      scoutedIds = []
    }
    scoutedIds.push(playerId)
    Save.setData(SaveKeys.SCOUTED_PROSPECT_IDS, [...new Set(scoutedIds)])
    this.updateDraftPage(0)
  }

  onDraft(prospectConfig: PlayerAgentConfig) {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    playerTeam.roster.push(prospectConfig)
    const draftProspects = Save.getData(SaveKeys.DRAFT_PROSPECTS).filter(
      (prospect: PlayerAgentConfig) => {
        return prospect.id !== prospectConfig.id
      }
    )
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, {
      [playerTeam.name]: playerTeam,
      ...allTeams,
    })
    Save.setData(SaveKeys.DRAFT_PROSPECTS, draftProspects)

    this.scene.renderActiveScreen(ScreenKeys.DRAFT, {
      playerPick: true,
      pickedProspect: prospectConfig,
    })
  }

  onRender(data?: any): void {
    this.updateDraftPage(0)
  }

  setVisible(isVisible: boolean) {
    this.titleText.setVisible(isVisible)
    this.draftProspectRows.forEach((row) => {
      row.setVisible(isVisible)
    })
    this.leftButton.setVisible(isVisible)
    this.rightButton.setVisible(isVisible)
    this.scoutPointsText.setVisible(isVisible)
  }

  generateDraftProspects() {
    const newPlayers: PlayerAgentConfig[] = []
    const playerRanks = [PlayerRank.BRONZE, PlayerRank.SILVER, PlayerRank.GOLD]
    for (let i = 1; i <= DraftProspectsScreen.NUM_DRAFT_PROSPECTS; i++) {
      newPlayers.push({
        id: `draft-prospect-${i}`,
        name: `draft-${i}`,
        isStarting: false,
        isRookie: true,
        texture: '',
        potential: Phaser.Math.Between(0, 2),
        attributes: {
          [PlayerAttributes.ACCURACY]: playerRanks[Phaser.Math.Between(0, playerRanks.length - 1)],
          [PlayerAttributes.HEADSHOT]: playerRanks[Phaser.Math.Between(0, playerRanks.length - 1)],
          [PlayerAttributes.REACTION]: playerRanks[Phaser.Math.Between(0, playerRanks.length - 1)],
        },
        contract: { ...MINIMUM_CONTRACT },
        experience: {
          [PlayerAttributes.ACCURACY]: 0,
          [PlayerAttributes.HEADSHOT]: 0,
          [PlayerAttributes.REACTION]: 0,
        },
      })
    }
    return newPlayers
  }
}
