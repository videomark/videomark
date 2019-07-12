import ChromeExtensionWrapper, { storage } from "./ChromeExtensionWrapper";
import Api from "./Api";

// 保持する最大数
const MaxSaveCount = 1e4;

class DataErase {
  constructor() {
    this.removedIds = [];
  }

  async initialize(viewings) {
    const targets = [
      ...(await new Promise(resolve =>
        ChromeExtensionWrapper.loadRemovedTarget(resolve)
      )),
      ...[...viewings.keys()].slice(0, viewings.size - MaxSaveCount)
    ];
    if (targets.length > 0) {
      await this.remove(targets);
      targets.forEach(target => viewings.delete(target));
    }
    return viewings;
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
    try {
      const response = await Api.erasure(targetIds);
      if (!response.ok) {
        throw new Error(response);
      }
      const body = await response.json();
      if (body.result.ok !== 1) {
        throw new Error(body);
      }
      this.removedIds = this.removedIds.filter(id => !targetIds.includes(id));
      ChromeExtensionWrapper.saveRemoveTarget(this.removedIds);
      const { index } = await new Promise(resolve =>
        storage().get("index", resolve)
      );
      if (Array.isArray(index))
        await new Promise(resolve =>
          storage().set(
            { index: index.filter(id => !targetIds.includes(id)) },
            resolve
          )
        );
      targetIds.forEach(id => {
        ChromeExtensionWrapper.remove(id);
      });
    } catch (error) {
      console.error(`VIDEOMARK: ${error}`);
    }
  }
}

export default new DataErase();
