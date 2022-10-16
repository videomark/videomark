export default class EventData {
  constructor(target, type, pos, time, last) {
    this.time = performance.now();
    this.date_time = Date.now();
    this.last = last;

    this.target = target;
    this.type = type;

    this.playPos = pos;
    this.playTime = time;
  }

  /**
   * 送信データフォーマットに変換
   */
  get() {
    return {
      time: this.time,
      dateTime: this.date_time,
      playPos: this.playPos,
      playTime: this.playTime,
    };
  }

  /**
   * デルタ用のデータを送信データフォーマットに変換
   */
  get_delta() {
    let delta;
    if (this.time > this.last) {
      delta = this.time - this.last;
    } else {
      delta = this.time;
    }
    return {
      delta,
      dateTime: this.date_time,
      playPos: this.playPos,
      playTime: this.playTime,
    };
  }

  /**
   * Debug
   */
  toJSON() {
    return JSON.stringify(this.get());
  }
}
