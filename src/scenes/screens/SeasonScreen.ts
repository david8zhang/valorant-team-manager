import { Save, SaveKeys } from '~/utils/Save'
import { Screen } from './Screen'
import TeamMgmt, { MatchConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { TeamRankings } from '~/core/ui/TeamRankings'
import { UpcomingMatch } from '~/core/ui/UpcomingMatch'
import { SeasonSchedule } from '~/core/ui/SeasonSchedule'
import { Button } from '~/core/ui/Button'
import { LinkText } from '~/core/ui/LinkText'
import { ScreenKeys } from './ScreenKeys'
import { SeasonOver } from '~/core/ui/SeasonOver'

export class SeasonScreen implements Screen {
  private scene: TeamMgmt
  private schedule: MatchConfig[] = []
  private upcomingMatch!: UpcomingMatch
  private seasonSchedule!: SeasonSchedule
  private rankingsList!: TeamRankings
  private startMatchButton!: Button
  private viewStartingLineupsLink!: LinkText

  private seasonOverText!: SeasonOver

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.setupStartMatchButton()
    this.setupRankings()
    this.setupSchedule()
    this.setupViewStartingLineupsLink()
    this.setupSeasonOverText()
    this.setupCurrentMatch()
    this.setVisible(false)
  }

  setupSeasonOverText() {
    const xPos = (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + TeamRankings.START_X) / 2
    this.seasonOverText = new SeasonOver(this.scene, {
      position: {
        x: xPos,
        y: RoundConstants.WINDOW_HEIGHT / 2 - 25,
      },
      onContinue: () => {
        this.scene.renderActiveScreen(ScreenKeys.DRAFT)
      },
    })
  }

  setupViewStartingLineupsLink() {
    this.viewStartingLineupsLink = new LinkText(this.scene, {
      text: 'View Starting Lineups',
      onClick: () => {
        const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX)
        const seasonSchedule = Save.getData(SaveKeys.SEASON_SCHEDULE) as MatchConfig[]
        const allTeamMapping = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as {
          [key: string]: TeamConfig
        }
        const currMatch = seasonSchedule[currMatchIndex]
        const opponentTeamConfig = allTeamMapping[currMatch.opponent]
        this.scene.renderActiveScreen(ScreenKeys.VIEW_LINEUPS, {
          opponentTeam: opponentTeamConfig,
        })
      },
      position: {
        x: this.startMatchButton.x,
        y: this.startMatchButton.y + 50,
      },
    })
  }

  setupStartMatchButton() {
    this.startMatchButton = new Button({
      scene: this.scene,
      x: (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + TeamRankings.START_X) / 2,
      y: RoundConstants.WINDOW_HEIGHT - 125,
      width: 200,
      height: 50,
      text: 'Start Match',
      backgroundColor: 0x444444,
      onClick: () => {
        this.scene.startGame()
      },
      fontSize: '20px',
      textColor: 'white',
      strokeColor: 0x000000,
      strokeWidth: 1,
    })
  }

  setupRankings() {
    const allTeamMapping = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as {
      [key: string]: TeamConfig
    }
    this.rankingsList = new TeamRankings(this.scene, {
      allTeams: Object.values(allTeamMapping),
    })
  }

  setupCurrentMatch() {
    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX)
    const seasonSchedule = Save.getData(SaveKeys.SEASON_SCHEDULE) as MatchConfig[]
    const allTeamMapping = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as {
      [key: string]: TeamConfig
    }

    // If the last season game has been played
    if (currMatchIndex < seasonSchedule.length) {
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
  }

  setupSchedule() {
    const schedule = Save.getData(SaveKeys.SEASON_SCHEDULE) as MatchConfig[]
    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX)
    this.seasonSchedule = new SeasonSchedule(this.scene, {
      schedule,
      currMatchIndex,
    })
  }

  displaySeasonOverText() {
    this.seasonOverText.display()
    this.viewStartingLineupsLink.setVisible(false)
    this.startMatchButton.setVisible(false)
  }

  updateUpcomingMatch() {
    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX)
    const seasonSchedule = Save.getData(SaveKeys.SEASON_SCHEDULE) as MatchConfig[]
    const allTeamMapping = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as {
      [key: string]: TeamConfig
    }
    const teamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME)
    if (currMatchIndex < seasonSchedule.length) {
      const currMatch = seasonSchedule[currMatchIndex]
      const homeTeam: TeamConfig = currMatch.isHome
        ? allTeamMapping[teamName]
        : allTeamMapping[currMatch.opponent]
      const awayTeam: TeamConfig = currMatch.isHome
        ? allTeamMapping[currMatch.opponent]
        : allTeamMapping[teamName]
      if (this.upcomingMatch) {
        this.upcomingMatch.updateTeams(homeTeam, awayTeam)
      }
    }
  }

  updateTeamRankings() {
    const allTeamMapping = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as {
      [key: string]: TeamConfig
    }
    this.rankingsList.updateRankings(Object.values(allTeamMapping))
  }

  onRender() {
    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX)
    const seasonSchedule = Save.getData(SaveKeys.SEASON_SCHEDULE) as MatchConfig[]
    if (currMatchIndex === seasonSchedule.length) {
      this.displaySeasonOverText()
    } else {
      this.updateUpcomingMatch()
    }
    this.updateTeamRankings()
    this.seasonSchedule.updateSchedulePage(0)
  }

  setVisible(isVisible: boolean) {
    this.seasonSchedule.setVisible(isVisible)
    this.rankingsList.setVisible(isVisible)
    if (this.upcomingMatch) {
      this.upcomingMatch.setVisible(isVisible)
    }
    this.startMatchButton.setVisible(isVisible)
    this.viewStartingLineupsLink.setVisible(isVisible)
    if (this.seasonOverText) {
      this.seasonOverText.setVisible(isVisible)
    }
  }
}
