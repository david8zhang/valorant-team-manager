export class Blackboard {
  public dataDictionary: any
  constructor() {
    this.dataDictionary = {}
  }

  public setData(key: string, data: any) {
    this.dataDictionary[key] = data
  }

  public getData(key: string): any {
    return this.dataDictionary[key]
  }
}
