export class MapConstants {
  public static DEFAULT_PLANT_LOCATIONS = {
    A: {
      x: 584,
      y: 152,
    },
    B: {
      x: 24,
      y: 104,
    },
  }

  public static MAP_CALLOUT_LOCATIONS = [
    {
      name: 'B-Plant',
      center: {
        x: 24,
        y: 104,
      },
    },
    {
      name: 'A-Plant',
      center: {
        x: 584,
        y: 152,
      },
    },
    {
      name: 'Tree',
      center: {
        x: 472,
        y: 168,
      },
    },
    {
      name: 'Heaven',
      center: {
        x: 600,
        y: 88,
      },
    },
    {
      name: 'A-Main',
      center: {
        x: 568,
        y: 304,
      },
    },
    {
      name: 'Wine',
      center: {
        x: 624,
        y: 328,
      },
    },
    {
      name: 'A-Lobby',
      center: {
        x: 472,
        y: 408,
      },
    },
    {
      name: 'Bottom-Mid',
      center: {
        x: 360,
        y: 376,
      },
    },
    {
      name: 'Mid-R',
      center: {
        x: 360,
        y: 296,
      },
    },
    {
      name: 'Mid-L',
      center: {
        x: 264,
        y: 296,
      },
    },
    {
      name: 'Arch',
      center: {
        x: 336,
        y: 232,
      },
    },
    {
      name: 'A-Door',
      center: {
        x: 520,
        y: 208,
      },
    },
    {
      name: 'Top-Mid',
      center: {
        x: 336,
        y: 184,
      },
    },
    {
      name: 'Pizza',
      center: {
        x: 328,
        y: 96,
      },
    },
    {
      name: 'Market',
      center: {
        x: 240,
        y: 144,
      },
    },
    {
      name: 'B-Door',
      center: {
        x: 192,
        y: 144,
      },
    },
    {
      name: 'B-Crates',
      center: {
        x: 144,
        y: 104,
      },
    },
    {
      name: 'B-Lane',
      center: {
        x: 56,
        y: 176,
      },
    },
    {
      name: 'B-Main',
      center: {
        x: 72,
        y: 240,
      },
    },
    {
      name: 'B-Lobby',
      center: {
        x: 64,
        y: 320,
      },
    },
    {
      name: 'Mid-Cubby',
      center: {
        x: 424,
        y: 256,
      },
    },
    {
      name: 'Mid-Link',
      center: {
        x: 200,
        y: 288,
      },
    },
  ]

  public static ATTACKER_POSITION_START = {
    x: 280,
    y: 470,
  }

  public static DEFENDER_POSITION_START = {
    x: 320,
    y: 20,
  }

  public static POST_PLANT_POSITIONS = {
    A: [
      {
        position: {
          x: 568,
          y: 312,
        },
        name: 'A_Main',
        holdPosition: {
          x: 586,
          y: 152,
        },
        control: ['A-Plant', 'Heaven'],
        vulnerable: ['A-Main'],
      },
      {
        position: {
          x: 632,
          y: 104,
        },
        name: 'A_Site_TopRight',
        holdPosition: {
          x: 520,
          y: 200,
        },
        control: ['A-Door', 'A-Plant'],
        vulnerable: ['A-Main', 'Heaven'],
      },
      {
        position: {
          x: 616,
          y: 232,
        },
        name: 'A_Site_BottomRight_Corner',
        holdPosition: {
          x: 600,
          y: 88,
        },
        control: ['Heaven', 'A-Plant'],
        vulnerable: ['A-Main'],
      },
      {
        position: {
          x: 536,
          y: 104,
        },
        name: 'A_Site_TopLeft',
        holdPosition: {
          x: 584,
          y: 248,
        },
        control: ['A-Plant'],
        vulnerable: ['Heaven'],
      },
      {
        position: {
          x: 536,
          y: 232,
        },
        name: 'A_Site_BottomLeft_Corner',
        holdPosition: {
          x: 600,
          y: 88,
        },
        control: ['Heaven', 'A-Plant'],
        vulnerable: ['A-Main'],
      },
      {
        position: {
          x: 632,
          y: 312,
        },
        name: 'A_Site_Wine',
        holdPosition: {
          x: 472,
          y: 296,
        },
        control: ['A-Main'],
        vulnerable: ['A-Plant'],
      },
    ],
  }

  public static INITIAL_SPIKE_POSITION = {
    x: 308,
    y: 440,
  }

  public static A_SITE_CENTER_POS: { x: number; y: number } = {
    x: 584,
    y: 136,
  }

  public static B_SITE_CENTER_POS: { x: number; y: number } = {
    x: 48,
    y: 96,
  }

  public static A_SITE_POSITIONS: any[] = []
  public static B_SITE_POSITIONS: any[] = []
  public static A_SITE_START: { x: number; y: number } = { x: 536, y: 104 }
  public static A_SITE_END: { x: number; y: number } = { x: 632, y: 168 }
  public static B_SITE_START: { x: number; y: number } = { x: 8, y: 56 }
  public static B_SITE_END: { x: number; y: number } = { x: 88, y: 136 }

  public static CALC_A_SITE_POSITIONS() {
    const start = MapConstants.A_SITE_START
    const end = MapConstants.A_SITE_END
    for (let x = start.x; x <= end.x; x += 16) {
      for (let y = start.y; y <= end.y; y += 16) {
        MapConstants.A_SITE_POSITIONS.push({ x, y })
      }
    }
  }

  public static CALC_B_SITE_POSITIONS() {
    const start = MapConstants.B_SITE_START
    const end = MapConstants.B_SITE_END
    for (let x = start.x; x <= end.x; x += 16) {
      for (let y = start.y; y <= end.y; y += 16) {
        MapConstants.B_SITE_POSITIONS.push({ x, y })
      }
    }
  }
}
