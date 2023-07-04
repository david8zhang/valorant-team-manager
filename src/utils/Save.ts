export enum SaveKeys {
  PLAYER_TEAM_NAME = 'PLAYER_TEAM_NAME',
  PLAYER_TEAM_ICON = 'PLAYER_TEAM_ICON',
  ALL_TEAM_CONFIGS = 'ALL_TEAM_CONFIGS',
  CPU_TEAM_ROSTER_MAPPING = 'CPU_TEAM_ROSTER_MAPPING',
  SEASON_SCHEDULE = 'SEASON_SCHEDULE',
  CURR_MATCH_INDEX = 'CURR_MATCH_INDEX',
  DRAFT_IN_PROGRESS = 'DRAFT_IN_PROGRESS',
  DRAFT_PROSPECTS = 'DRAFT_PROSPECTS',
  FREE_AGENTS = 'FREE_AGENTS',
  DRAFT_ORDER = 'DRAFT_ORDER',
  CURR_PICK_INDEX = 'CURR_PICK_INDEX',
  SCOUT_POINTS = 'SCOUT_POINTS',
  SCOUTED_PROSPECT_IDS = 'SCOUTED_PROSPECT_IDS',
  PLAYOFF_BRACKET = 'PLAYOFF_BRACKET',
  CURR_PLAYOFF_ROUND = 'CURR_PLAYOFF_ROUND',
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
