export default class MeasureState {
  constructor(qoeValue) {
    // 視聴中
    if (qoeValue === -1) {
      this.state = 1;
    } else if (qoeValue === -2 || qoeValue === 0) {
      this.state = 2;
    } else {
      this.state = 0;
    }
  }

  IsViewing() {
    return this.state === 1;
  }

  IsTimeout() {
    return this.state === 2;
  }

  IsCompleted() {
    return !(this.IsViewing() || this.IsTimeout());
  }
}
