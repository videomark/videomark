import Api from "./Api";

class RegionalAverageQoE {
  constructor(regions = []) {
    this.regions = regions;
  }

  async fetchSubbdivisionQoEAPI({ country, subdivision }) {
    if (!window.navigator.onLine) return undefined;
    const response = await Api.subdivision(country, subdivision);
    if (!response.ok) return undefined;
    const json = await response.json();
    if (!Array.isArray(json)) return undefined;
    const regionalData = json.find(
      r => r.country === country && r.subdivision === subdivision
    );
    if (regionalData === undefined) return undefined;
    const { average } = regionalData.data[0];
    Object.assign(this.cache, {
      [country]: Object.assign(this.cache[country] || {}, {
        [subdivision]: average
      })
    });
    return this.cache;
  }

  async init() {
    if (this.cache === undefined) {
      this.cache = {};
      await Promise.all(
        this.regions.map(this.fetchSubbdivisionQoEAPI.bind(this))
      );
    }
    return this.cache;
  }

  async at({ country, subdivision }) {
    if (
      this.cache[country] === undefined ||
      this.cache[country][subdivision] === undefined
    )
      await this.fetchSubbdivisionQoEAPI({ country, subdivision });
    if (this.cache[country] === undefined) return undefined;
    return this.cache[country][subdivision];
  }
}
export default RegionalAverageQoE;
