import Config from "./Config";

class ResourceTiming {
  constructor() {
    this.reversedHistories = [];

    this.transferSize = 0;
    this.bufferSize = Config.DEFAULT_RESOURCE_BUFFER_SIZE;

    const bufferFullHandler = () => {
      this.bufferSize += 50;
      performance.setResourceTimingBufferSize(this.bufferSize);
    };
    performance.removeEventListener(
      "resourcetimingbufferfull",
      bufferFullHandler
    );
    performance.setResourceTimingBufferSize(this.bufferSize);
    performance.addEventListener("resourcetimingbufferfull", bufferFullHandler);
  }

  collect() {
    const previousValue = { transferSize: this.transferSize };
    const resources = performance.getEntriesByType("resource").slice();
    performance.clearResourceTimings();
    this.transferSize += resources.reduce(
      (a, { transferSize }) => a + transferSize,
      0
    );

    while (resources.length) {
      const resource = resources.pop();
      if (!resource.name.startsWith(Config.get_sodium_server_url()) && !resource.name.startsWith(Config.get_fluent_url()))
        this.reversedHistories.unshift(resource);
    }
    return [previousValue, { transferSize: this.transferSize }];
  }

  find(url) {
    return performance.getEntriesByType("resource").find(element => element.name === url) || this.reversedHistories.find(element => element.name === url);
  }

  toDate(hires) {
    return new Date(performance.timeOrigin + hires);
  }
}

const instance = new ResourceTiming();
export default instance;
