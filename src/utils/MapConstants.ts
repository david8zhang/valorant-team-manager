export interface Region {
  name: string
  center: {
    x: number
    y: number
  }
  topLeft: {
    x: number
    y: number
  }
  bottomRight: {
    x: number
    y: number
  }
}

// TODO: These constants should be different across multiple different maps
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
      topLeft: {
        x: 24,
        y: 104,
      },
      bottomRight: {
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
      topLeft: {
        x: 584,
        y: 152,
      },
      bottomRight: {
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
      topLeft: {
        x: 456,
        y: 152,
      },
      bottomRight: {
        x: 488,
        y: 216,
      },
    },
    {
      name: 'Heaven',
      center: {
        x: 600,
        y: 88,
      },
      topLeft: {
        x: 584,
        y: 88,
      },
      bottomRight: {
        x: 616,
        y: 88,
      },
    },
    {
      name: 'A-Main',
      center: {
        x: 568,
        y: 304,
      },
      topLeft: {
        x: 472,
        y: 296,
      },
      bottomRight: {
        x: 632,
        y: 312,
      },
    },
    {
      name: 'Wine',
      center: {
        x: 624,
        y: 328,
      },
      topLeft: {
        x: 616,
        y: 328,
      },
      bottomRight: {
        x: 632,
        y: 344,
      },
    },
    {
      name: 'A-Lobby',
      center: {
        x: 472,
        y: 408,
      },
      topLeft: {
        x: 424,
        y: 360,
      },
      bottomRight: {
        x: 520,
        y: 472,
      },
    },
    {
      name: 'Bottom-Mid',
      center: {
        x: 360,
        y: 376,
      },
      topLeft: {
        x: 312,
        y: 360,
      },
      bottomRight: {
        x: 408,
        y: 392,
      },
    },
    {
      name: 'Mid-R',
      center: {
        x: 360,
        y: 296,
      },
      topLeft: {
        x: 328,
        y: 248,
      },
      bottomRight: {
        x: 392,
        y: 344,
      },
    },
    {
      name: 'Mid-L',
      center: {
        x: 264,
        y: 296,
      },
      topLeft: {
        x: 248,
        y: 248,
      },
      bottomRight: {
        x: 280,
        y: 344,
      },
    },
    {
      name: 'Arch',
      center: {
        x: 336,
        y: 232,
      },
      topLeft: {
        x: 328,
        y: 232,
      },
      bottomRight: {
        x: 344,
        y: 232,
      },
    },
    {
      name: 'A-Door',
      center: {
        x: 520,
        y: 208,
      },
      topLeft: {
        x: 504,
        y: 200,
      },
      bottomRight: {
        x: 520,
        y: 216,
      },
    },
    {
      name: 'Top-Mid',
      center: {
        x: 336,
        y: 184,
      },
      topLeft: {
        x: 296,
        y: 152,
      },
      bottomRight: {
        x: 376,
        y: 216,
      },
    },
    {
      name: 'Pizza',
      center: {
        x: 328,
        y: 96,
      },
      topLeft: {
        x: 296,
        y: 88,
      },
      bottomRight: {
        x: 376,
        y: 104,
      },
    },
    {
      name: 'Market',
      center: {
        x: 240,
        y: 144,
      },
      topLeft: {
        x: 216,
        y: 104,
      },
      bottomRight: {
        x: 264,
        y: 184,
      },
    },
    {
      name: 'B-Door',
      center: {
        x: 192,
        y: 144,
      },
      topLeft: {
        x: 184,
        y: 136,
      },
      bottomRight: {
        x: 200,
        y: 152,
      },
    },
    {
      name: 'B-Crates',
      center: {
        x: 144,
        y: 104,
      },
      topLeft: {
        x: 120,
        y: 56,
      },
      bottomRight: {
        x: 168,
        y: 184,
      },
    },
    {
      name: 'B-Lane',
      center: {
        x: 56,
        y: 176,
      },
      topLeft: {
        x: 8,
        y: 168,
      },
      bottomRight: {
        x: 104,
        y: 184,
      },
    },
    {
      name: 'B-Main',
      center: {
        x: 72,
        y: 240,
      },
      topLeft: {
        x: 8,
        y: 232,
      },
      bottomRight: {
        x: 136,
        y: 248,
      },
    },
    {
      name: 'B-Lobby',
      center: {
        x: 64,
        y: 320,
      },
      topLeft: {
        x: 8,
        y: 280,
      },
      bottomRight: {
        x: 136,
        y: 360,
      },
    },
    {
      name: 'Mid-Cubby',
      center: {
        x: 424,
        y: 256,
      },
      topLeft: {
        x: 472,
        y: 264,
      },
      bottomRight: {
        x: 472,
        y: 264,
      },
    },
    {
      name: 'Mid-Link',
      center: {
        x: 200,
        y: 288,
      },
      topLeft: {
        x: 184,
        y: 264,
      },
      bottomRight: {
        x: 216,
        y: 328,
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
