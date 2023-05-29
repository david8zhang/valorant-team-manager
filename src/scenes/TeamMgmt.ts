import { Sidebar } from '~/core/ui/Sidebar'
import { RoundConstants } from '~/utils/RoundConstants'
import {
  DEFAULT_CONTRACT,
  PlayerAttributes,
  PlayerPotential,
  PlayerRank,
} from '~/utils/PlayerConstants'
import { Save, SaveKeys } from '~/utils/Save'
import { CPU_TEAM_NAMES, SHORT_NAMES } from '~/utils/TeamConstants'
import { Utilities } from '~/utils/Utilities'
import { ScreenKeys } from './screens/ScreenKeys'
import { HomeScreen } from './screens/HomeScreen'
import { SeasonScreen } from './screens/SeasonScreen'
import { TeamScreen } from './screens/TeamScreen'
import { RosterScreen } from './screens/RosterScreen'
import { PlayerDrilldownScreen } from './screens/PlayerDrilldown/PlayerDrilldownScreen'
import { ViewLineupsScreen } from './screens/ViewLineupsScreen'
import { DraftProspectsScreen } from './screens/Draft/DraftProspectsScreen'
import { DraftScreen } from './screens/Draft/DraftScreen'
import { SubstitutePlayerScreen } from './screens/SubstitutePlayerScreen'
import { FrontOfficeScreen } from './screens/FrontOffice/FrontOfficeScreen'
import { ContractsScreen } from './screens/FrontOffice/ContractsScreen'
import { ContractDrilldownScreen } from './screens/FrontOffice/ContractDrilldownScreen'

export interface PlayerAgentConfig {
  id: string
  name: string
  texture: string
  isStarting: boolean
  isRookie: boolean
  potential: PlayerPotential
  contract: {
    salary: number
    duration: number
  }
  attributes: {
    [key in PlayerAttributes]: PlayerRank
  }
  experience: {
    [key in PlayerAttributes]: number
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
  public static BODY_WIDTH = RoundConstants.WINDOW_WIDTH - RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH

  public screens!: {
    [key in ScreenKeys]: any
  }
  public activeScreenKey: ScreenKeys = ScreenKeys.HOME
  public prevScreenKey: ScreenKeys = ScreenKeys.HOME

  constructor() {
    super('team-mgmt')
  }

  initializeNewGameData() {
    const newPlayers = this.generateNewPlayers(RoundConstants.TEAM_NAME_PLACEHOLDER)
    const teamConfigMapping = this.generateTeams()
    const seasonSchedule = this.generateSchedule(Object.values(teamConfigMapping))
    const winLossRecord = {
      wins: 0,
      losses: 0,
    }
    // Add player team to the mapping
    teamConfigMapping[RoundConstants.TEAM_NAME_PLACEHOLDER] = {
      name: RoundConstants.TEAM_NAME_PLACEHOLDER,
      ...winLossRecord,
      roster: newPlayers,
    }
    Save.setData(SaveKeys.PLAYER_TEAM_NAME, RoundConstants.TEAM_NAME_PLACEHOLDER)
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, teamConfigMapping)
    Save.setData(SaveKeys.SEASON_SCHEDULE, seasonSchedule)
    Save.setData(SaveKeys.CURR_MATCH_INDEX, 0)
    Save.setData(SaveKeys.SCOUT_POINTS, RoundConstants.DEFAULT_SCOUT_POINTS)
  }

  startGame() {
    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX) as number
    const schedule = Save.getData(SaveKeys.SEASON_SCHEDULE) as MatchConfig[]
    const allTeamMapping = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as {
      [teamName: string]: TeamConfig
    }
    this.renderActiveScreen(ScreenKeys.SEASON)
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
        id: `${teamName}-player-${i}`,
        name: `${prefix}-${i}`,
        isStarting: true,
        isRookie: true,
        texture: '',
        potential: Phaser.Math.Between(0, 2),
        contract: {
          ...DEFAULT_CONTRACT,
        },
        attributes: {
          [PlayerAttributes.ACCURACY]: PlayerRank.BRONZE,
          [PlayerAttributes.HEADSHOT]: PlayerRank.BRONZE,
          [PlayerAttributes.REACTION]: PlayerRank.BRONZE,
        },
        experience: {
          [PlayerAttributes.ACCURACY]: 0,
          [PlayerAttributes.HEADSHOT]: 0,
          [PlayerAttributes.REACTION]: 0,
        },
      })
    }
    return newPlayers
  }

  create() {
    if (!Save.getData(SaveKeys.ALL_TEAM_CONFIGS)) {
      this.initializeNewGameData()
    }
    this.screens = {
      [ScreenKeys.HOME]: new HomeScreen(this),
      [ScreenKeys.SEASON]: new SeasonScreen(this),
      [ScreenKeys.TEAM]: new TeamScreen(this),
      [ScreenKeys.TEAM_ROSTER]: new RosterScreen(this),
      [ScreenKeys.PLAYER_DRILLDOWN]: new PlayerDrilldownScreen(this),
      [ScreenKeys.VIEW_LINEUPS]: new ViewLineupsScreen(this),
      [ScreenKeys.DRAFT_PROSPECTS]: new DraftProspectsScreen(this),
      [ScreenKeys.DRAFT]: new DraftScreen(this),
      [ScreenKeys.SUBSTITUTE_PLAYER]: new SubstitutePlayerScreen(this),
      [ScreenKeys.FRONT_OFFICE]: new FrontOfficeScreen(this),
      [ScreenKeys.CONTRACTS]: new ContractsScreen(this),
      [ScreenKeys.CONTRACT_DRILLDOWN]: new ContractDrilldownScreen(this),
    }
    this.add
      .rectangle(201, 0, RoundConstants.WINDOW_WIDTH - 202, RoundConstants.WINDOW_HEIGHT - 2)
      .setOrigin(0)
      .setStrokeStyle(1, 0x000000)
    this.cameras.main.setBackgroundColor('#ffffff')
    this.sidebar = new Sidebar(this, {
      width: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH,
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
          onClick: () => {
            this.renderActiveScreen(ScreenKeys.TEAM)
          },
        },
        {
          text: 'Front Office',
          onClick: () => {
            this.renderActiveScreen(ScreenKeys.FRONT_OFFICE)
          },
        },
      ],
    })
    this.renderActiveScreen(this.activeScreenKey)
  }

  goBackToPreviousScreen() {
    this.renderActiveScreen(this.prevScreenKey)
  }

  renderActiveScreen(newActiveScreenKey: ScreenKeys, data?: any) {
    if (this.activeScreenKey) {
      this.prevScreenKey = this.activeScreenKey
      const prevActiveScreen = this.screens[this.activeScreenKey]
      prevActiveScreen.setVisible(false)
    }
    this.activeScreenKey = newActiveScreenKey
    const newActiveScreen = this.screens[this.activeScreenKey]
    newActiveScreen.setVisible(true)
    newActiveScreen.onRender(data)
  }
}
