import { Save, SaveKeys } from '~/utils/Save'
import { Screen } from './Screen'
import TeamMgmt, { MatchConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { UpcomingMatch } from '../UpcomingMatch'
import { TeamRankings } from '../TeamRankings'
import { SeasonSchedule } from '../SeasonSchedule'

export class SeasonScreen implements Screen {
  private scene: TeamMgmt
  private schedule: MatchConfig[] = []
  private upcomingMatch!: UpcomingMatch
  private seasonSchedule!: SeasonSchedule
  private rankingsList!: TeamRankings

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.setupCurrentMatch()
    this.setupRankings()
    this.setupSchedule()
    this.setVisible(false)
  }

  setupRankings() {
    const allTeamMapping = Save.getData(SaveKeys.CPU_CONTROLLED_TEAM_CONFIGS) as {
      [key: string]: TeamConfig
    }
    this.rankingsList = new TeamRankings(this.scene, {
      allTeams: Object.values(allTeamMapping),
    })
  }

  setupCurrentMatch() {
    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX)
    const seasonSchedule = Save.getData(SaveKeys.SEASON_SCHEDULE) as MatchConfig[]
    const allTeamMapping = Save.getData(SaveKeys.CPU_CONTROLLED_TEAM_CONFIGS) as {
      [key: string]: TeamConfig
    }
    const teamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME)
    const currMatch = seasonSchedule[currMatchIndex]
    const homeTeam: TeamConfig = currMatch.isHome
      ? allTeamMapping[teamName]
      : allTeamMapping[currMatch.opponent]
    const awayTeam: TeamConfig = currMatch.isHome
      ? allTeamMapping[currMatch.opponent]
      : allTeamMapping[teamName]

    this.upcomingMatch = new UpcomingMatch(this.scene, {
      homeTeam,
      awayTeam,
    })
  }

  setupSchedule() {
    const schedule = Save.getData(SaveKeys.SEASON_SCHEDULE) as MatchConfig[]
    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX)
    this.seasonSchedule = new SeasonSchedule(this.scene, {
      schedule,
      currMatchIndex,
    })
  }

  updateUpcomingMatch() {
    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX)
    const seasonSchedule = Save.getData(SaveKeys.SEASON_SCHEDULE) as MatchConfig[]
    const allTeamMapping = Save.getData(SaveKeys.CPU_CONTROLLED_TEAM_CONFIGS) as {
      [key: string]: TeamConfig
    }
    const teamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME)
    const currMatch = seasonSchedule[currMatchIndex]
    const homeTeam: TeamConfig = currMatch.isHome
      ? allTeamMapping[teamName]
      : allTeamMapping[currMatch.opponent]
    const awayTeam: TeamConfig = currMatch.isHome
      ? allTeamMapping[currMatch.opponent]
      : allTeamMapping[teamName]
    this.upcomingMatch.updateTeams(homeTeam, awayTeam)
  }

  updateTeamRankings() {
    const allTeamMapping = Save.getData(SaveKeys.CPU_CONTROLLED_TEAM_CONFIGS) as {
      [key: string]: TeamConfig
    }
    this.rankingsList.updateRankings(Object.values(allTeamMapping))
  }

  onRender() {
    this.updateUpcomingMatch()
    this.updateTeamRankings()
    this.seasonSchedule.updateSchedulePage(0)
  }

  setVisible(isVisible: boolean) {
    this.seasonSchedule.setVisible(isVisible)
    this.rankingsList.setVisible(isVisible)
    this.upcomingMatch.setVisible(isVisible)
  }
}
