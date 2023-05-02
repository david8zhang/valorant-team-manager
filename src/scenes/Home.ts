import { Sidebar } from '~/core/ui/Sidebar'
import { Constants } from '~/utils/Constants'

export default class Home extends Phaser.Scene {
  private sidebar!: Sidebar
  constructor() {
    super('home')
  }

  create() {
    this.sidebar = new Sidebar(this, {
      options: [
        {
          text: 'Home',
          onClick: () => {},
        },
        {
          text: 'Season',
          onClick: () => {},
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
  }
}
