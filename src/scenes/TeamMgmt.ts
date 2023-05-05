import { Sidebar } from '~/core/ui/Sidebar'
import { HomeScreen } from '~/core/ui/screens/HomeScreen'
import { ScreenKeys } from '~/core/ui/screens/ScreenKeys'
import { SeasonScreen } from '~/core/ui/screens/SeasonScreen'
import { Constants } from '~/utils/Constants'
import { PlayerRank } from '~/utils/PlayerConstants'
import { Save, SaveKeys } from '~/utils/Save'
import { CPU_TEAM_NAMES, SHORT_NAMES } from '~/utils/TeamConstants'
import { Utilities } from '~/utils/Utilities'

export interface PlayerAgentConfig {
  name: string
  texture: string
  stats: {
    accuracy: PlayerRank
    headshot: PlayerRank
    reaction: PlayerRank
  }
}

export interface TeamConfig {
  name: string
  shortName: string
  wins: number
  losses: number
  roster: PlayerAgentConfig[]
}

export interface MatchConfig {
  opponent: string
  shortName: string
  isHome: boolean
}

export default class TeamMgmt extends Phaser.Scene {
  private sidebar!: Sidebar
  public static BODY_WIDTH = Constants.WINDOW_WIDTH - Constants.TEAM_MGMT_SIDEBAR_WIDTH

  public screens!: {
    [key in ScreenKeys]: any
  }
  public activeScreenKey: ScreenKeys = ScreenKeys.HOME

  constructor() {
    super('team-mgmt')
  }

  initializeNewGameData() {
    const newPlayers = this.generateNewPlayers(Constants.TEAM_NAME_PLACEHOLDER)
    const teamConfigMapping = this.generateTeams()
    const seasonSchedule = this.generateSchedule(Object.values(teamConfigMapping))
    const winLossRecord = {
      wins: 0,
      losses: 0,
    }
    // Add player team to the mapping
    teamConfigMapping[Constants.TEAM_NAME_PLACEHOLDER] = {
      name: Constants.TEAM_NAME_PLACEHOLDER,
      ...winLossRecord,
      roster: newPlayers,
    }
    Save.setData(SaveKeys.PLAYER_AGENT_CONFIGS, newPlayers)
    Save.setData(SaveKeys.PLAYER_TEAM_NAME, Constants.TEAM_NAME_PLACEHOLDER)
    Save.setData(SaveKeys.PLAYER_TEAM_WIN_LOSS_RECORD, winLossRecord)
    Save.setData(SaveKeys.CPU_CONTROLLED_TEAM_CONFIGS, teamConfigMapping)
    Save.setData(SaveKeys.SEASON_SCHEDULE, seasonSchedule)
    Save.setData(SaveKeys.CURR_MATCH_INDEX, 0)
  }

  startGame() {
    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX) as number
    const schedule = Save.getData(SaveKeys.SEASON_SCHEDULE) as MatchConfig[]
    const allTeamMapping = Save.getData(SaveKeys.CPU_CONTROLLED_TEAM_CONFIGS) as {
      [teamName: string]: TeamConfig
    }
    const currMatch = schedule[currMatchIndex]
    this.scene.start('round', {
      cpuTeamConfig: allTeamMapping[currMatch.opponent],
    })
    this.scene.start('ui', {
      cpuTeamConfig: allTeamMapping[currMatch.opponent],
    })
  }

  generateTeams() {
    const shuffledCPUTeamNames = Utilities.shuffle([...CPU_TEAM_NAMES])
    const allTeams = shuffledCPUTeamNames
      .map((teamName) => {
        return {
          name: teamName,
          shortName: SHORT_NAMES[teamName],
          wins: 0,
          losses: 0,
          roster: this.generateNewPlayers(teamName),
        }
      })
      .slice(0, shuffledCPUTeamNames.length - 1)
    const teamNameToObjMapping = allTeams.reduce((acc, curr) => {
      acc[curr.name] = curr
      return acc
    }, {})
    return teamNameToObjMapping
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

  generateNewPlayers(teamName: string): PlayerAgentConfig[] {
    const newPlayers: PlayerAgentConfig[] = []
    const prefix = SHORT_NAMES[teamName]
    for (let i = 1; i <= 3; i++) {
      newPlayers.push({
        name: `${prefix}-${i}`,
        texture: '',
        stats: {
          accuracy: PlayerRank.BRONZE,
          headshot: PlayerRank.BRONZE,
          reaction: PlayerRank.BRONZE,
        },
      })
    }
    return newPlayers
  }

  create() {
    this.initializeNewGameData()
    this.screens = {
      [ScreenKeys.HOME]: new HomeScreen(this),
      [ScreenKeys.SEASON]: new SeasonScreen(this),
    }
    this.add
      .rectangle(201, 0, Constants.WINDOW_WIDTH - 202, Constants.WINDOW_HEIGHT - 2)
      .setOrigin(0)
      .setStrokeStyle(1, 0x000000)
    this.cameras.main.setBackgroundColor('#ffffff')
    this.sidebar = new Sidebar(this, {
      width: Constants.TEAM_MGMT_SIDEBAR_WIDTH,
      options: [
        {
          text: 'Home',
          onClick: () => {
            this.renderActiveScreen(ScreenKeys.HOME)
          },
        },
        {
          text: 'Season',
          onClick: () => {
            this.renderActiveScreen(ScreenKeys.SEASON)
          },
        },
        {
          text: 'My Team',
          onClick: () => {},
        },
        {
          text: 'Front Office',
          onClick: () => {},
        },
      ],
    })
    this.renderActiveScreen(this.activeScreenKey)
  }

  renderActiveScreen(newActiveScreenKey: ScreenKeys) {
    if (this.activeScreenKey) {
      const prevActiveScreen = this.screens[this.activeScreenKey]
      prevActiveScreen.setVisible(false)
    }
    this.activeScreenKey = newActiveScreenKey
    const newActiveScreen = this.screens[this.activeScreenKey]
    newActiveScreen.onRender()
    newActiveScreen.setVisible(true)
  }
}
