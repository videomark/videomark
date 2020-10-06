import ChromeExtensionWrapper, { storage } from "./ChromeExtensionWrapper";
import Api from "./Api";
import ViewingModel from "./Viewing";

// 保持する最大数
const MaxSaveCount = 1e4;

class DataErase {
  removedIds: any;
  constructor() {
    this.removedIds = [];
  }

  async initialize(viewings: any) {
    const targets = [
      // @ts-expect-error ts-migrate(2461) FIXME: Type 'unknown' is not an array type.
      ...(await new Promise((resolve) =>
        ChromeExtensionWrapper.loadRemovedTarget(resolve)
      )),
      ...[...viewings.keys()].slice(0, viewings.size - MaxSaveCount),
    ];
    if (targets.length > 0) {
      await this.remove(targets);
      targets.forEach((target) => viewings.delete(target));
    }
    return viewings;
  }

  add(id: any) {
    this.removedIds.push(id);
    ChromeExtensionWrapper.saveRemoveTarget(this.removedIds);
  }

  recover(targetId: any) {
    this.removedIds = this.removedIds.filter((id: any) => id !== targetId);
    ChromeExtensionWrapper.saveRemoveTarget(this.removedIds);
  }

  contains(id: any) {
    return this.removedIds.includes(id);
  }

  async remove(param: any) {
    const targetIds = Array.isArray(param) ? param : [param];
    try {
      // indexの更新
      const { index } = await new Promise((resolve) =>
        storage().get("index", resolve)
      );
      if (Array.isArray(index))
        await new Promise((resolve) =>
          storage().set(
            { index: index.filter((id) => !targetIds.includes(id)) },
            resolve
          )
        );

      // サーバーへ削除要求するid一覧
      const request = (
        await Promise.all(
          targetIds.map((id) => new ViewingModel({ id }).init())
        )
      )
        .filter(({ valid }) => valid)
        .map(({ sessionId, videoId }) => ({
          session: sessionId,
          video: videoId,
        }));

      if (request.length > 0) {
        const response = await Api.erasure(request);
        if (!response.ok) {
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Response' is not assignable to p... Remove this comment to see the full error message
          throw new Error(response);
        }
        const body = await response.json();
        if (body.result.ok !== 1) {
          throw new Error(body);
        }
      }

      // 削除処理の終えたものを取り除く
      this.removedIds = this.removedIds.filter((id: any) => !targetIds.includes(id));
      ChromeExtensionWrapper.saveRemoveTarget(this.removedIds);

      // ストレージにある実体を削除
      targetIds.forEach((id) => ChromeExtensionWrapper.remove(id));
    } catch (error) {
      console.error(`VIDEOMARK: ${error}`);
    }
  }
}

export default new DataErase();
