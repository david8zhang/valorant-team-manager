export enum ActionStatus {
  RUNNING = 'RUNNING',
  COMPLETE = 'COMPLETE',
}

export interface Action {
  getStatus(): ActionStatus
  execute(...args: any): void
  enter(): void
  exit(): void
}
