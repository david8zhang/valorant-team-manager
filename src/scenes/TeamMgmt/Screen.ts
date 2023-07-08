export interface Screen {
  setVisible(isVisible: boolean): void
  onRender(data?: any): void
}
