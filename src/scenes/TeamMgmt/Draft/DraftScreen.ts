import TeamMgmt, { MatchConfig, PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt/TeamMgmt'
import { Screen } from '../Screen'
import { RoundConstants } from '~/utils/RoundConstants'
import { Save, SaveKeys } from '~/utils/Save'
import { DraftAnnouncement } from '~/core/ui/DraftAnnouncement'
import { Button } from '~/core/ui/Button'
import { ScreenKeys } from '../ScreenKeys'
import { Utilities } from '~/utils/Utilities'
import { DraftProspectsScreen } from './DraftProspectsScreen'
import { MINIMUM_CONTRACT, PlayerAttributes, PlayerRank } from '~/utils/PlayerConstants'
import { SHORT_NAMES } from '~/utils/TeamConstants'

export class DraftScreen implements Screen {
  private scene: TeamMgmt
  private titleText: Phaser.GameObjects.Text
  private headerDivider: Phaser.GameObjects.Line
  private sectionDivider: Phaser.GameObjects.Line
  private teamNamesGroup: Phaser.GameObjects.Group
  private draftAnnouncement!: DraftAnnouncement
  private draftPromptText!: Phaser.GameObjects.Text
  private draftPromptButton!: Button
  private continueDraftButton!: Button
  private currPickIndex: number = 0

  private draftCompletedText!: Phaser.GameObjects.Text
  private draftCompletedButton!: Button

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.titleText = this.scene.add.text(RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15, 15, 'Draft', {
      fontSize: '30px',
      color: 'black',
    })
    this.headerDivider = this.scene.add
      .line(
        0,
        0,
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH,
        this.titleText.y + this.titleText.displayHeight + 10,
        RoundConstants.WINDOW_WIDTH,
        this.titleText.y + this.titleText.displayHeight + 10
      )
      .setOrigin(0)
    this.headerDivider.setStrokeStyle(1, 0x000000)
    this.sectionDivider = this.scene.add
      .line(
        0,
        0,
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 350,
        this.titleText.y + this.titleText.displayHeight + 10,
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 350,
        RoundConstants.WINDOW_HEIGHT,
        0x000000
      )
      .setOrigin(0)
    this.sectionDivider.setStrokeStyle(1, 0x000000)

    this.teamNamesGroup = this.scene.add.group()
    this.setupDraftPrompt()
    this.setupContinueDraftButton()
    this.setupDraftAnnouncement()
    this.setupDraftCompletedPrompt()
    this.setVisible(false)
  }

  generateSchedule(otherTeamConfigs: TeamConfig[]): MatchConfig[] {
    const result: MatchConfig[] = []
    otherTeamConfigs.forEach((team) => {
      result.push({
        isHome: true,
        opponent: team.name,
        shortName: SHORT_NAMES[team.name],
      })
      result.push({
        isHome: false,
        opponent: team.name,
        shortName: SHORT_NAMES[team.name],
      })
    })
    return Utilities.shuffle([...result])
  }

  startNewSeason() {
    const allTeamConfigs = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME)
    const schedule = this.generateSchedule(
      Object.values(allTeamConfigs).filter((teamConfig: TeamConfig) => {
        return teamConfig.name !== playerTeamName
      })
    )
    Object.keys(allTeamConfigs).forEach((key: string) => {
      allTeamConfigs[key] = { ...allTeamConfigs[key], wins: 0, losses: 0 }
    })
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeamConfigs)
    Save.setData(SaveKeys.SEASON_SCHEDULE, schedule)
    Save.setData(SaveKeys.CURR_MATCH_INDEX, 0)
    this.resetDraft()
    this.scene.renderActiveScreen(ScreenKeys.SEASON, {
      isNewSeason: true,
    })
  }

  resetDraft() {
    Save.setData(SaveKeys.CURR_PICK_INDEX, 0)
    Save.setData(SaveKeys.SCOUT_POINTS, RoundConstants.DEFAULT_SCOUT_POINTS)
    Save.setData(SaveKeys.SCOUTED_PROSPECT_IDS, [])
  }

  setupDraftCompletedPrompt() {
    this.draftCompletedText = this.scene.add.text(
      (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 350 + RoundConstants.WINDOW_WIDTH) / 2,
      RoundConstants.WINDOW_HEIGHT / 3,
      'Draft Complete!',
      {
        fontSize: '18px',
        color: 'black',
      }
    )
    this.draftCompletedButton = new Button({
      scene: this.scene,
      x: this.draftCompletedText.x,
      y: this.draftCompletedText.y + this.draftCompletedText.displayHeight + 50,
      width: 150,
      height: 50,
      fontSize: '18px',
      strokeColor: 0x000000,
      strokeWidth: 1,
      text: 'Continue',
      onClick: () => {
        this.endDraft()
      },
    })
    this.draftCompletedText.setVisible(false)
    this.draftCompletedButton.setVisible(false)
    this.draftCompletedText.setPosition(
      this.draftCompletedText.x - this.draftCompletedText.displayWidth / 2,
      this.draftCompletedText.y
    )
  }

  endDraft() {
    Save.setData(SaveKeys.DRAFT_IN_PROGRESS, false)

    // All draft prospects at this point will have been undrafted
    const undraftedPlayers = Save.getData(SaveKeys.DRAFT_PROSPECTS)
    Utilities.processFreeAgents(undraftedPlayers)
    this.processCPUExpiringContracts()
    this.fillCPURostersWithFreeAgents()
    this.adjustCPUStartingLineups()
    this.startNewSeason()
  }

  adjustCPUStartingLineups() {
    const allTeamMappings = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const cpuControlledTeams = Utilities.getCPUControlledTeamFromSave()
    cpuControlledTeams.forEach((teamConfig: TeamConfig) => {
      const startingLineup = teamConfig.roster.filter(
        (playerAgent: PlayerAgentConfig) => playerAgent.isStarting
      )
      const reservesSortedByOVR = teamConfig.roster
        .filter((playerAgent: PlayerAgentConfig) => !playerAgent.isStarting)
        .sort((a, b) => {
          return Utilities.getOverallPlayerRank(b) - Utilities.getOverallPlayerRank(a)
        })

      if (startingLineup.length < RoundConstants.NUM_STARTERS) {
        for (let i = 0; i < RoundConstants.NUM_STARTERS - startingLineup.length; i++) {
          console.log(
            `${teamConfig.name}: ${reservesSortedByOVR[i].name} has been added to the starting lineup!`
          )
          reservesSortedByOVR[i].isStarting = true
        }
        const newRoster = startingLineup.concat(reservesSortedByOVR)
        allTeamMappings[teamConfig.name].roster = newRoster
      }
    })
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeamMappings)
  }

  processCPUExpiringContracts() {
    const allTeamsMapping = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as {
      [key: string]: TeamConfig
    }
    const cpuControlledTeams = Utilities.getCPUControlledTeamFromSave()
    let allFreeAgents: PlayerAgentConfig[] = []
    cpuControlledTeams.forEach((teamConfig: TeamConfig) => {
      // Get all expiring player contracts
      const expiringPlayers = teamConfig.roster.filter(
        (playerConfig) => playerConfig.contract.duration === 0
      )

      // Get all non-expiring player contracts
      const returningPlayers = teamConfig.roster.filter(
        (playerConfig) => playerConfig.contract.duration > 0
      )

      const playersToKeep: PlayerAgentConfig[] = []
      const playersToWaive: PlayerAgentConfig[] = []
      let guaranteedSalary = Utilities.getTotalSalary(returningPlayers)
      const sortedByOverallDesc = expiringPlayers.sort((a, b) => {
        return Utilities.getOverallPlayerRank(b) - Utilities.getOverallPlayerRank(a)
      })
      sortedByOverallDesc.forEach((playerConfig: PlayerAgentConfig) => {
        const durationAsk = Phaser.Math.Between(2, 4)
        const newSalary = Utilities.getExtensionEstimate(playerConfig, durationAsk)

        // The maximum amount we can offer a player is the total salary cap minus 2 minimum salary contracts
        const maxContractAmount =
          RoundConstants.SALARY_CAP - (RoundConstants.NUM_STARTERS - 1) * MINIMUM_CONTRACT.salary

        // Ensure that the team has enough salary cap space to sign the player
        if (newSalary <= maxContractAmount) {
          playersToKeep.push({
            ...playerConfig,
            contract: {
              duration: durationAsk,
              salary: newSalary,
            },
          })
          guaranteedSalary += newSalary
        } else {
          playersToWaive.push({
            ...playerConfig,
            contract: {
              duration: durationAsk,
              salary: newSalary,
            },
          })
        }
      })
      // Update the CPU roster based on salary re-negotiations
      const newRoster = playersToKeep.concat(returningPlayers)
      teamConfig.roster = newRoster
      allTeamsMapping[teamConfig.name] = teamConfig
      allFreeAgents = allFreeAgents.concat(playersToWaive)
    })
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeamsMapping)
    const existingFreeAgents = Save.getData(SaveKeys.FREE_AGENTS) || []
    const newFreeAgents = existingFreeAgents.concat(allFreeAgents)
    Save.setData(SaveKeys.FREE_AGENTS, newFreeAgents)
  }

  fillCPURostersWithFreeAgents() {
    const allTeamsMapping = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const cpuControlledTeams = Utilities.getCPUControlledTeamFromSave()
    const allFreeAgents = Save.getData(SaveKeys.FREE_AGENTS) as PlayerAgentConfig[]
    const sortedByOvr = allFreeAgents.sort((a, b) => {
      return Utilities.getOverallPlayerRank(b) - Utilities.getOverallPlayerRank(a)
    })
    const signedFreeAgents = new Set()
    cpuControlledTeams.forEach((teamConfig: TeamConfig) => {
      if (teamConfig.roster.length < RoundConstants.NUM_STARTERS) {
        const newRoster = teamConfig.roster
        for (let i = 0; i < RoundConstants.NUM_STARTERS - teamConfig.roster.length; i++) {
          const currSalary = Utilities.getTotalSalary(newRoster)
          let hasSignedPlayer = false
          sortedByOvr.forEach((playerAgentConfig: PlayerAgentConfig) => {
            if (
              playerAgentConfig.contract.salary <= RoundConstants.SALARY_CAP - currSalary &&
              !hasSignedPlayer &&
              !signedFreeAgents.has(playerAgentConfig.id)
            ) {
              console.log(
                `${teamConfig.name} signed ${playerAgentConfig.name} for $${playerAgentConfig.contract.salary}M for ${playerAgentConfig.contract.duration} years`
              )
              newRoster.push(playerAgentConfig)
              hasSignedPlayer = true
              signedFreeAgents.add(playerAgentConfig.id)
            }
          })
        }
        allTeamsMapping[teamConfig.name].roster = newRoster
      }
    })
    const newFreeAgents = allFreeAgents.filter((playerAgentConfig: PlayerAgentConfig) => {
      return !signedFreeAgents.has(playerAgentConfig.id)
    })
    Save.setData(SaveKeys.FREE_AGENTS, newFreeAgents)
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeamsMapping)
  }

  setupContinueDraftButton() {
    this.continueDraftButton = new Button({
      scene: this.scene,
      onClick: () => {
        this.processPickAndRenderResult()
      },
      width: 175,
      height: 50,
      strokeWidth: 1,
      strokeColor: 0x000000,
      x: (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 350 + RoundConstants.WINDOW_WIDTH) / 2,
      y: RoundConstants.WINDOW_HEIGHT / 2,
      fontSize: '18px',
      textColor: 'black',
      text: this.currPickIndex === 0 ? 'Start Draft' : 'Continue Draft',
    })
  }

  setupDraftPrompt() {
    this.draftPromptText = this.scene.add.text(
      (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 350 + RoundConstants.WINDOW_WIDTH) / 2,
      RoundConstants.WINDOW_HEIGHT / 2,
      "It's your pick!",
      {
        fontSize: '18px',
        color: 'black',
      }
    )
    this.draftPromptText.setPosition(
      this.draftPromptText.x - this.draftPromptText.displayWidth / 2,
      RoundConstants.WINDOW_HEIGHT / 3
    )
    this.draftPromptButton = new Button({
      scene: this.scene,
      onClick: () => {
        this.scene.renderActiveScreen(ScreenKeys.DRAFT_PROSPECTS)
      },
      text: 'Pick',
      width: 150,
      height: 50,
      x: (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 350 + RoundConstants.WINDOW_WIDTH) / 2,
      y: RoundConstants.WINDOW_HEIGHT / 2,
      fontSize: '18px',
      strokeColor: 0x000000,
      strokeWidth: 1,
    })
  }

  setupDraftAnnouncement() {
    this.draftAnnouncement = new DraftAnnouncement(
      this.scene,
      {
        x: (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 350 + RoundConstants.WINDOW_WIDTH) / 2,
        y: RoundConstants.WINDOW_HEIGHT / 4,
      },
      () => {
        this.processPickAndRenderResult()
      }
    )
  }

  setupDraftOrder() {
    let draftOrder = Save.getData(SaveKeys.DRAFT_ORDER) as string[]
    this.currPickIndex = Save.getData(SaveKeys.CURR_PICK_INDEX)
    if (this.currPickIndex == undefined) {
      Save.setData(SaveKeys.CURR_PICK_INDEX, 0)
      this.currPickIndex = 0
    }
    this.teamNamesGroup.clear(true, true)
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    let yPos = this.titleText.y + this.titleText.displayHeight + 25
    const xPos = RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15
    if (!draftOrder) {
      const sortedByRecord = Object.values(allTeams).sort((a, b) => {
        const aWinLoss = Utilities.getWinLossRatio(a)
        const bWinLoss = Utilities.getWinLossRatio(b)
        if (aWinLoss === bWinLoss) {
          return Phaser.Math.Between(0, 1) === 1 ? 1 : -1
        }
        return aWinLoss - bWinLoss
      })
      draftOrder = sortedByRecord.map((teamConfig: TeamConfig) => teamConfig.name)
      Save.setData(SaveKeys.DRAFT_ORDER, draftOrder)
    }
    draftOrder.forEach((teamName: string, index: number) => {
      const teamConfig = allTeams[teamName]
      const teamNameText = this.scene.add.text(xPos, yPos, `${index + 1}. ${teamConfig.name}`, {
        fontSize: '15px',
        color: 'black',
      })
      if (index < this.currPickIndex) {
        teamNameText.setStyle({ color: 'gray' })
      }
      this.teamNamesGroup.add(teamNameText)
      yPos += teamNameText.displayHeight + 15
    })
  }

  showDraftCompletedPrompt() {
    this.draftAnnouncement.hide()
    this.draftPromptButton.setVisible(false)
    this.draftPromptText.setVisible(false)
    this.continueDraftButton.setVisible(false)
    this.draftCompletedText.setVisible(true)
    this.draftCompletedButton.setVisible(true)
  }

  announcePlayerPick(data?: any) {
    const currPickIndex = Save.getData(SaveKeys.CURR_PICK_INDEX)
    const draftOrder = Save.getData(SaveKeys.DRAFT_ORDER) as string[]
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const pickingTeam = allTeams[draftOrder[currPickIndex]] as TeamConfig
    this.draftPromptButton.setVisible(false)
    this.draftPromptText.setVisible(false)
    this.continueDraftButton.setVisible(false)
    this.draftAnnouncement.announceDraftPick({
      teamConfig: pickingTeam,
      draftProspect: data.pickedProspect,
      pickNum: currPickIndex,
    })
    this.goToNextPick()
  }

  onRender(data?: any): void {
    if (data && data.isNewDraft) {
      const savedDraftProspects = Utilities.generateDraftProspects().sort((a, b) => {
        return Utilities.getOverallPlayerRank(b) - Utilities.getOverallPlayerRank(a)
      })
      Save.setData(SaveKeys.DRAFT_PROSPECTS, savedDraftProspects)
      Save.setData(SaveKeys.DRAFT_IN_PROGRESS, true)
    }
    this.setupDraftOrder()
    const currPickIndex = Save.getData(SaveKeys.CURR_PICK_INDEX)
    const draftOrder = Save.getData(SaveKeys.DRAFT_ORDER) as string[]
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const pickingTeam = allTeams[draftOrder[currPickIndex]] as TeamConfig
    const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME) as string

    this.draftCompletedText.setVisible(false)
    this.draftCompletedButton.setVisible(false)
    if (currPickIndex === draftOrder.length - 1) {
      this.showDraftCompletedPrompt()
    } else if (data && data.playerPick) {
      this.announcePlayerPick(data)
    } else {
      this.draftAnnouncement.hide()
      if (pickingTeam.name === playerTeamName) {
        this.draftPromptButton.setVisible(true)
        this.draftPromptText.setVisible(true)
        this.continueDraftButton.setVisible(false)
      } else {
        this.continueDraftButton.setText(currPickIndex === 0 ? 'Start Draft' : 'Continue Draft')
        this.draftPromptButton.setVisible(false)
        this.draftPromptText.setVisible(false)
        this.continueDraftButton.setVisible(true)
      }
    }
  }

  loadSavedDraftProspects() {
    let savedDraftProspects = Save.getData(SaveKeys.DRAFT_PROSPECTS) as PlayerAgentConfig[]
    if (!savedDraftProspects) {
      savedDraftProspects = Utilities.generateDraftProspects().sort((a, b) => {
        return Utilities.getOverallPlayerRank(b) - Utilities.getOverallPlayerRank(a)
      })
      Save.setData(SaveKeys.DRAFT_PROSPECTS, savedDraftProspects)
    }
    return savedDraftProspects
  }

  processPickAndRenderResult() {
    const draftOrder = Save.getData(SaveKeys.DRAFT_ORDER) as string[]
    this.teamNamesGroup.children.entries.forEach(
      (text: Phaser.GameObjects.GameObject, index: number) => {
        const textObj = text as Phaser.GameObjects.Text
        if (index < this.currPickIndex) {
          textObj.setStyle({ color: 'gray' })
        }
      }
    )
    if (this.currPickIndex < draftOrder.length) {
      if (this.isPlayerPick()) {
        this.draftAnnouncement.hide()
        this.draftPromptButton.setVisible(true)
        this.draftPromptText.setVisible(true)
        this.continueDraftButton.setVisible(false)
      } else {
        const config = this.processCurrPick()
        this.draftAnnouncement.announceDraftPick(config)
        this.goToNextPick()
      }
    } else {
      this.showDraftCompletedPrompt()
    }
  }

  goToNextPick() {
    const draftOrder = Save.getData(SaveKeys.DRAFT_ORDER) as string[]
    this.currPickIndex++
    if (this.currPickIndex === draftOrder.length) {
      // Draft is over
    } else {
      Save.setData(SaveKeys.CURR_PICK_INDEX, this.currPickIndex)
    }
  }

  isPlayerPick() {
    const currPickIndex = Save.getData(SaveKeys.CURR_PICK_INDEX)
    const draftOrder = Save.getData(SaveKeys.DRAFT_ORDER) as string[]
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const pickingTeam = allTeams[draftOrder[currPickIndex]] as TeamConfig
    const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME)
    return pickingTeam.name === playerTeamName
  }

  processCurrPick() {
    this.continueDraftButton.setVisible(false)
    const currPickIndex = Save.getData(SaveKeys.CURR_PICK_INDEX)
    const draftOrder = Save.getData(SaveKeys.DRAFT_ORDER) as string[]
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const pickingTeam = allTeams[draftOrder[currPickIndex]] as TeamConfig
    const prospects = this.loadSavedDraftProspects()
    const sortedByOverallDesc = prospects.sort((a, b) => {
      return Utilities.getOverallPlayerRank(b) - Utilities.getOverallPlayerRank(a)
    })
    pickingTeam.roster.push(sortedByOverallDesc[0])
    const newAllTeams = {
      [pickingTeam.name]: pickingTeam,
      ...allTeams,
    }
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, newAllTeams)
    Save.setData(SaveKeys.DRAFT_PROSPECTS, sortedByOverallDesc.slice(1))
    return {
      teamConfig: pickingTeam,
      draftProspect: sortedByOverallDesc[0],
      pickNum: currPickIndex,
    }
  }

  setVisible(isVisible: boolean): void {
    this.titleText.setVisible(isVisible)
    this.teamNamesGroup.setVisible(isVisible)
    this.draftAnnouncement.setVisible(isVisible)
    this.headerDivider.setVisible(isVisible)
    this.sectionDivider.setVisible(isVisible)
    this.draftAnnouncement.setVisible(isVisible)
    this.draftPromptButton.setVisible(isVisible)
    this.draftPromptText.setVisible(isVisible)
    this.continueDraftButton.setVisible(isVisible)
    this.draftCompletedButton.setVisible(isVisible)
    this.draftCompletedText.setVisible(isVisible)
  }
}
