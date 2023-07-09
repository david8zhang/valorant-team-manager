import { Sidebar } from '~/core/ui/Sidebar'
import { RoundConstants } from '~/utils/RoundConstants'
import {
  MINIMUM_CONTRACT,
  PlayerAttributes,
  PlayerPotential,
  PlayerRank,
} from '~/utils/PlayerConstants'
import { Save, SaveKeys } from '~/utils/Save'
import { CPU_TEAM_NAMES, SHORT_NAMES } from '~/utils/TeamConstants'
import { Utilities } from '~/utils/Utilities'
import { ScreenKeys } from './ScreenKeys'
import { HomeScreen } from './HomeScreen'
import { SeasonScreen } from './SeasonScreen'
import { TeamScreen } from './TeamScreen'
import { RosterScreen } from './RosterScreen'
import { PlayerDrilldownScreen } from './PlayerDrilldown/PlayerDrilldownScreen'
import { ViewLineupsScreen } from './ViewLineupsScreen'
import { DraftProspectsScreen } from './Draft/DraftProspectsScreen'
import { DraftScreen } from './Draft/DraftScreen'
import { SubstitutePlayerScreen } from './SubstitutePlayerScreen'
import { FrontOfficeScreen } from './FrontOffice/FrontOfficeScreen'
import { ContractsScreen } from './FrontOffice/Contracts/ContractsScreen'
import { ContractDrilldownScreen } from './FrontOffice/Contracts/ContractDrilldownScreen'
import { PlayoffsScreen } from './Playoffs/PlayoffsScreen'
import { PlayerPlayoffMatchResult } from '~/utils/SimulationUtils'
import { TeamsToTradeWithScreen } from './FrontOffice/Trades/TeamsToTradeWithScreen'
import { TradeNegotiationScreen } from './FrontOffice/Trades/TradeNegotationScreen'
import { FreeAgentScreen } from './FrontOffice/FreeAgents/FreeAgentScreen'
import { CreateTeamScreen } from '../FirstTime/CreateTeamScreen'

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

export interface TeamMgmtData {
  playoffResult?: PlayerPlayoffMatchResult
}

export default class TeamMgmt extends Phaser.Scene {
  private sidebar!: Sidebar
  public static BODY_WIDTH = RoundConstants.WINDOW_WIDTH - RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH
  private activeScreenData!: TeamMgmtData

  public screens!: {
    [key in ScreenKeys]: any
  }
  public activeScreenKey: ScreenKeys = ScreenKeys.HOME
  public prevScreenKey: ScreenKeys = ScreenKeys.HOME

  constructor() {
    super('team-mgmt')
  }

  init(data: TeamMgmtData) {
    this.activeScreenData = data
  }

  startGame() {
    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX) as number
    const schedule = Save.getData(SaveKeys.SEASON_SCHEDULE) as MatchConfig[]
    const allTeamMapping = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as {
      [teamName: string]: TeamConfig
    }
    const playerTeamConfig = allTeamMapping[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    this.renderActiveScreen(ScreenKeys.SEASON)
    const currMatch = schedule[currMatchIndex]
    this.scene.start('round', {
      cpuTeamConfig: allTeamMapping[currMatch.opponent],
      playerTeamConfig: playerTeamConfig,
    })
    this.scene.start('ui', {
      cpuTeamConfig: allTeamMapping[currMatch.opponent],
      playerTeamConfig: playerTeamConfig,
    })
  }

  startPlayoffGame(opponent: TeamConfig) {
    const playerTeamConfig = Utilities.getPlayerTeamFromSave()
    this.scene.start('round', {
      cpuTeamConfig: opponent,
      playerTeamConfig: playerTeamConfig,
      isPlayoffGame: true,
    })
    this.scene.start('ui', {
      cpuTeamConfig: opponent,
      playerTeamConfig: playerTeamConfig,
      isPlayoffGame: true,
    })
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

  create() {
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
      [ScreenKeys.PLAYOFFS]: new PlayoffsScreen(this),
      [ScreenKeys.TRADES]: new TeamsToTradeWithScreen(this),
      [ScreenKeys.TRADE_NEGOTIATION]: new TradeNegotiationScreen(this),
      [ScreenKeys.FREE_AGENTS]: new FreeAgentScreen(this),
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
    this.renderDefaultScreen()
  }

  renderDefaultScreen() {
    const isDraftInProgress = Save.getData(SaveKeys.DRAFT_IN_PROGRESS) as boolean
    if (isDraftInProgress) {
      this.activeScreenKey = ScreenKeys.DRAFT
    }
    this.renderActiveScreen(this.activeScreenKey, this.activeScreenData)
  }

  goBackToPreviousScreen() {
    this.renderActiveScreen(this.prevScreenKey)
  }

  renderActiveScreen(newActiveScreenKey: ScreenKeys, data?: any) {
    if (this.activeScreenKey !== newActiveScreenKey) {
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
