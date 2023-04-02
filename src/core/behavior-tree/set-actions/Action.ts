export enum ActionStatus {
  NOT_STARTED = 'NOT_STARTED',
  RUNNING = 'RUNNING',
  COMPLETE = 'COMPLETE',
}

export abstract class Action {
  public abstract getStatus(): ActionStatus
  public execute(...args: any): void {}
  public enter(): void {}
  public exit(): void {}
}
