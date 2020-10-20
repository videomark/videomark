// アプリケーションの全体データ
// コールバックを指定をし、対象のデータが更新された時に全箇所に流す;
/* eslint-disable max-classes-per-file */
import AppDataActions from "./AppDataActions";

class Data {
  callbacks: any;
  data: any;
  constructor() {
    this.callbacks = [];
    this.data = null;
  }

  update(data: any) {
    this.data = data;
    this.callbacks.forEach((i: any) => i.object[i.funcName](data));
  }

  add(callbackObject: any) {
    this.callbacks.push(callbackObject);
  }

  remove(callbackObject: any) {
    this.callbacks = this.callbacks.filter(
      (item: any) => !callbackObject.equals(item)
    );
  }
}

const MakeActionCallback = (object: any, funcName: any) => {
  return {
    object,
    funcName,

    equals: (callbackObject: any) => {
      return (
        object === callbackObject.object && funcName === callbackObject.funcName
      );
    },
  };
};

class AppData {
  data: any;
  constructor() {
    this.data = {};
    Object.keys(AppDataActions).forEach((key) => {
      if (key in this.data) {
        Error("duplicate key");
      }

      // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
      this.data[AppDataActions[key]] = new Data();
    });
  }

  get(key: any) {
    return this.data[key].data;
  }

  // @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'data' implicitly has an 'any[]' ty... Remove this comment to see the full error message
  update(key: any, ...data) {
    this.data[key].update(...data);
  }

  add(key: any, object: any, funcName: any) {
    const callbackObject = MakeActionCallback(object, funcName);
    this.data[key].add(callbackObject);
  }

  remove(key: any, object: any, funcName: any) {
    const callbackObject = MakeActionCallback(object, funcName);
    this.data[key].remove(callbackObject);
  }
}

const instance = new AppData();
export default instance;
