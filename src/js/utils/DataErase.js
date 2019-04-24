import ChromeExtensionWrapper from "./ChromeExtensionWrapper";
import Api from "./Api";

// 保持する最大数
const MaxSaveCount = 1e4;

class DataErase {
  constructor() {
    this.removedIds = [];
  }

  async initialize() {
    const targets = await new Promise(resolve =>
      ChromeExtensionWrapper.loadRemovedTarget(resolve)
    );
    if (targets.length > 0) await this.remove(targets);

    const viewings = await new Promise(resolve =>
      ChromeExtensionWrapper.loadVideoIds(resolve)
    );
    const ascViewings = viewings.sort(
      (a, b) => a.data.start_time - b.data.start_time
    );
    if (MaxSaveCount < ascViewings.length) {
      await this.remove(
        ascViewings
          .slice(0, ascViewings.length - MaxSaveCount)
          .map(({ id }) => id)
      );
    }
  }

  add(id) {
    this.removedIds.push(id);
    ChromeExtensionWrapper.saveRemoveTarget(this.removedIds);
  }

  recover(targetId) {
    this.removedIds = this.removedIds.filter(id => id !== targetId);
    ChromeExtensionWrapper.saveRemoveTarget(this.removedIds);
  }

  contains(id) {
    return this.removedIds.includes(id);
  }

  async remove(param) {
    const targetIds = Array.isArray(param) ? param : [param];
    await Api.erasure(targetIds)
      .then(response => {
        if (!response.ok) {
          throw new Error(response);
        }

        return response.json();
      })
      .then(body => {
        if (body.result.ok !== 1) {
          throw new Error(body);
        }
        this.removedIds = this.removedIds.filter(id => !targetIds.includes(id));
        ChromeExtensionWrapper.saveRemoveTarget(this.removedIds);
        targetIds.forEach(id => {
          ChromeExtensionWrapper.remove(id);
        });
      })
      .catch(error => {
        console.error(`VIDEOMARK: ${error}`);
      });
  }
}

export default new DataErase();
