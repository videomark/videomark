import Config from "./Config";

export default class ResourceTiming {
  constructor() {
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
    return [previousValue, { transferSize: this.transferSize }];
  }
}
