import { input } from '~/core/ui/dom-components/Input'
import { Screen } from '../TeamMgmt/Screen'
import { FirstTime } from './FirstTime'
import { Button } from '~/core/ui/Button'
import { RoundConstants } from '~/utils/RoundConstants'
import { FirstTimeScreenKeys } from './FirstTimeScreenKeys'
import { Save, SaveKeys } from '~/utils/Save'

export class CreateTeamScreen implements Screen {
  private scene: FirstTime
  public headerText!: Phaser.GameObjects.Text

  public createTeamNameLabel!: Phaser.GameObjects.Text
  public createTeamNameInputDom!: Phaser.GameObjects.DOMElement
  public createTeamNameInputHTML!: HTMLElement

  public createTeamAbbrevLabel!: Phaser.GameObjects.Text
  public createTeamAbbrevInputDom!: Phaser.GameObjects.DOMElement
  public createTeamAbbrevInputHTML!: HTMLElement

  public nextButton!: Button

  constructor(scene: FirstTime) {
    this.scene = scene
    this.headerText = this.scene.add
      .text(30, 30, 'Create your team', {
        fontSize: '30px',
        color: 'black',
      })
      .setOrigin(0)
    this.setupCreateNameTextInput()
    this.setupCreateTeamAbbrev()
    this.setupNextButton()
    this.setVisible(false)
  }

  setupCreateNameTextInput() {
    this.createTeamNameLabel = this.scene.add.text(
      this.headerText.x,
      this.headerText.y + this.headerText.displayHeight + 30,
      'Enter a team name',
      {
        fontSize: '15px',
        color: 'black',
      }
    )
    this.createTeamNameInputHTML = input(
      { fontSize: '20px', width: '300px' },
      { id: 'createTeamName' }
    ) as HTMLElement
    this.createTeamNameInputDom = this.scene.add
      .dom(
        this.createTeamNameLabel.x,
        this.createTeamNameLabel.y + this.createTeamNameLabel.displayHeight + 15,
        this.createTeamNameInputHTML
      )
      .setOrigin(0)
  }

  setupCreateTeamAbbrev() {
    this.createTeamAbbrevLabel = this.scene.add.text(
      this.headerText.x,
      this.createTeamNameInputDom.y + 65,
      'Enter a 3-letter team name abbreviation (for in round display)',
      {
        fontSize: '15px',
        color: 'black',
      }
    )
    this.createTeamAbbrevInputHTML = input(
      { fontSize: '20px', width: '300px', textTransform: 'uppercase' },
      { maxLength: 3, id: 'createTeamAbbrev' }
    ) as HTMLElement
    this.createTeamAbbrevInputDom = this.scene.add
      .dom(
        this.createTeamAbbrevLabel.x,
        this.createTeamAbbrevLabel.y + this.createTeamAbbrevLabel.displayHeight + 15,
        this.createTeamAbbrevInputHTML
      )
      .setOrigin(0)
  }

  setupNextButton() {
    this.nextButton = new Button({
      scene: this.scene,
      onClick: () => {
        this.scene.teamName = (this.createTeamNameInputHTML as any).value
        this.scene.teamShortName = (this.createTeamAbbrevInputHTML as any).value.toUpperCase()
        this.scene.renderActiveScreen(FirstTimeScreenKeys.DRAFT_STARTERS)
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
  }

  onRender(data?: any): void {}
  setVisible(isVisible: boolean): void {
    this.headerText.setVisible(isVisible)
    this.createTeamNameLabel.setVisible(isVisible)
    this.createTeamNameInputDom.setVisible(isVisible)
    this.createTeamAbbrevLabel.setVisible(isVisible)
    this.createTeamAbbrevInputDom.setVisible(isVisible)
    this.nextButton.setVisible(isVisible)
  }
}
