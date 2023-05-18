export enum Sites {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum RoundState {
  PREROUND = 'PREROUND',
  MID_ROUND = 'MID_ROUND',
  PRE_PLANT_ROUND = 'PRE_PLANT_ROUND',
  POST_PLANT_ROUND = 'POST_PLANT_ROUND',
  POSTROUND = 'POSTROUND',
  OVERTIME = 'OVERTIME',
}

export class RoundConstants {
  public static TEAM_MGMT_SIDEBAR_WIDTH = 200
  public static TEAM_NAME_PLACEHOLDER = 'Guangdong Tigers'
  public static TEAM_SHORT_NAME = 'GDT'
  public static DEFAULT_SCOUT_POINTS = 3

  public static KILL_CREDITS_AMOUNT = 500
  public static ASSIST_CREDITS_AMOUNT = 250

  public static PREROUND_TIME_SEC = 1
  public static MID_ROUND_TIME_SEC = 1
  public static OVERTIME_ROUND_TIME_SEC = 45

  public static TOP_BAR_HEIGHT = 60
  public static BOTTOM_BAR_HEIGHT = 60
  public static RIGHT_BAR_WIDTH = 250

  public static MAP_WIDTH = 640
  public static MAP_HEIGHT = 480

  public static WINDOW_WIDTH = RoundConstants.MAP_WIDTH + RoundConstants.RIGHT_BAR_WIDTH
  public static WINDOW_HEIGHT =
    RoundConstants.MAP_HEIGHT + RoundConstants.TOP_BAR_HEIGHT + RoundConstants.BOTTOM_BAR_HEIGHT

  public static SORT_LAYERS = {
    UI: 30,
    Player: 20,
    TopLayer: 10,
    BottomLayer: 0,
  }
}
