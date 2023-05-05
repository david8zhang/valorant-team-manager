export enum SaveKeys {
  PLAYER_AGENT_CONFIGS = 'PLAYER_AGENT_CONFIGS',
  PLAYER_TEAM_NAME = 'PLAYER_TEAM_NAME',
  PLAYER_TEAM_ICON = 'PLAYER_TEAM_ICON',
  PLAYER_TEAM_WIN_LOSS_RECORD = 'PLAYER_TEAM_WIN_LOSS_RECORD',
  CPU_CONTROLLED_TEAM_CONFIGS = 'CPU_CONTROLLED_TEAM_CONFIGS',
  CPU_TEAM_ROSTER_MAPPING = 'CPU_TEAM_ROSTER_MAPPING',
  SEASON_SCHEDULE = 'SEASON_SCHEDULE',
  CURR_MATCH_INDEX = 'CURR_MATCH_INDEX',
}

export class Save {
  private static LOCAL_STORAGE_KEY = 'fps-manager-save'
  private static saveObj: {
    [key in SaveKeys]?: any
  }
  private static _instance: Save

  constructor() {
    const rawSaveObj = localStorage.getItem(Save.LOCAL_STORAGE_KEY)
    if (!rawSaveObj) {
      Save.saveObj = {}
      localStorage.setItem(Save.LOCAL_STORAGE_KEY, JSON.stringify(Save.saveObj))
    } else {
      Save.saveObj = JSON.parse(rawSaveObj)
    }
    Save._instance = this
  }

  public static get instance() {
    return Save._instance
  }

  public static clearSave() {
    localStorage.clear()
  }

  public static getData(key: SaveKeys) {
    return this.saveObj[key]
  }

  public static setData(key: SaveKeys, data: any) {
    this.saveObj[key] = data
    localStorage.setItem(Save.LOCAL_STORAGE_KEY, JSON.stringify(this.saveObj))
  }
}
