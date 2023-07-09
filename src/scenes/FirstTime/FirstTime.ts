import { RoundConstants } from '~/utils/RoundConstants'
import { FirstTimeScreenKeys } from './FirstTimeScreenKeys'
import { CreateTeamScreen } from './CreateTeamScreen'
import { DraftStartingPlayersScreen } from './DraftStartingPlayersScreen'
import { PlayerAgentConfig, TeamConfig } from '../TeamMgmt/TeamMgmt'
import { Save, SaveKeys } from '~/utils/Save'
import { Utilities } from '~/utils/Utilities'

export class FirstTime extends Phaser.Scene {
  public screens!: {
    [key in FirstTimeScreenKeys]: any
  }
  public activeScreenKey: FirstTimeScreenKeys = FirstTimeScreenKeys.CREATE_TEAM
  public teamName: string = ''
  public teamShortName: string = ''
  public selectedPlayers: PlayerAgentConfig[] = []

  constructor() {
    super('ftue')
  }

  create() {
    this.cameras.main.setBackgroundColor(0xffffff)
    const bgRect = this.add
      .rectangle(1, 0, RoundConstants.WINDOW_WIDTH - 2, RoundConstants.WINDOW_HEIGHT - 2)
      .setStrokeStyle(1, 0x000000)
      .setOrigin(0)
    this.screens = {
      [FirstTimeScreenKeys.CREATE_TEAM]: new CreateTeamScreen(this),
      [FirstTimeScreenKeys.DRAFT_STARTERS]: new DraftStartingPlayersScreen(this),
    }
    this.renderActiveScreen(FirstTimeScreenKeys.CREATE_TEAM)
  }

  renderActiveScreen(newActiveScreenKey: FirstTimeScreenKeys) {
    if (this.activeScreenKey) {
      const prevActiveScreen = this.screens[this.activeScreenKey]
      prevActiveScreen.setVisible(false)
    }
    this.activeScreenKey = newActiveScreenKey
    const newActiveScreen = this.screens[this.activeScreenKey]
    newActiveScreen.onRender()
    newActiveScreen.setVisible(true)
  }

  initializeNewGameData() {
    const teamConfigMapping = Utilities.generateTeams() as { [key: string]: TeamConfig }
    const seasonSchedule = Utilities.generateSchedule(Object.values(teamConfigMapping))
    const winLossRecord = {
      wins: 0,
      losses: 0,
    }

    // If the team name or abbrev entered by the player is the same as an existing one, delete it
    let teamNameToDelete = ''
    Object.values(teamConfigMapping).forEach((teamConfig: TeamConfig) => {
      if (teamConfig.name === this.teamName || teamConfig.shortName === this.teamShortName) {
        teamNameToDelete = this.teamName
      }
    })
    delete teamConfigMapping[teamNameToDelete]

    // Add player team to the mapping
    teamConfigMapping[this.teamName] = {
      name: this.teamName,
      ...winLossRecord,
      shortName: this.teamShortName,
      roster: this.selectedPlayers,
    }
    Save.setData(SaveKeys.PLAYER_TEAM_NAME, this.teamName)
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, teamConfigMapping)
    Save.setData(SaveKeys.SEASON_SCHEDULE, seasonSchedule)
    Save.setData(SaveKeys.CURR_MATCH_INDEX, 0)
    Save.setData(SaveKeys.SCOUT_POINTS, RoundConstants.DEFAULT_SCOUT_POINTS)
    this.scene.start('team-mgmt')
  }
}
