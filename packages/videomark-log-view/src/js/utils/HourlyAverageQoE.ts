import Api from "./Api";

class HourlyAverageQoE {
  cache: any;
  constructor() {
    this.cache = {};
  }

  async fetchHourlyQoEAPI() {
    if (!window.navigator.onLine) return undefined;
    const response = await Api.hour();
    if (!response.ok) return undefined;
    const json = await response.json();

    if (!Array.isArray(json)) return undefined;
    this.cache = json.reduce(
      (a, { hour, average }) => Object.assign(a, { [hour]: average }),
      {}
    );
    return this.cache;
  }

  async at(hour: any) {
    if (this.cache[hour] === undefined) await this.fetchHourlyQoEAPI();
    return this.cache[hour];
  }
}
export default HourlyAverageQoE;
