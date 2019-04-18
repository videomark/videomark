import ChromeExtensionWrapper from "./ChromeExtensionWrapper";
import Api from "./Api";

// 保持する最大数
const MaxSaveCount = 2000;

class DataErase {
  constructor() {
    this.removedIds = [];
  }

  async initialize() {
    const promise = new Promise(resolve => {
      ChromeExtensionWrapper.loadRemovedTarget(removedTargetIds => {
        const eraseIds = [];
        removedTargetIds.forEach(id => eraseIds.push(id));

        ChromeExtensionWrapper.loadVideoIds(async savedVideo => {
          const video = savedVideo
            .filter(id => !eraseIds.includes(id))
            .sort((a, b) => a.data.start_time - b.data.start_time);

          for (let i = 0; i < video.length - MaxSaveCount; i += 1) {
            eraseIds.push(video[i].id);
          }

          this.removedIds = eraseIds;
          if (this.removedIds.length > 0) {
            await this.remove(eraseIds);
          }
          resolve();
        });
      });
    });

    await promise;
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
