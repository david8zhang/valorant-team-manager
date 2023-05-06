export interface Screen {
  setVisible(isVisible: boolean): void
  onRender(): void
}
