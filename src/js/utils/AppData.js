// アプリケーションの全体データ
// コールバックを指定をし、対象のデータが更新された時に全箇所に流す;
import AppDataActions from "./AppDataActions";

class Data {
  constructor() {
    this.callbacks = [];
    this.data = null;
  }

  update(data) {
    this.data = data;
    this.callbacks.forEach(i => i.object[i.funcName](data));
  }

  add(callbackObject) {
    this.callbacks.push(callbackObject);
  }

  remove(callbackObject) {
    this.callbacks = this.callbacks.filter(
      item => !callbackObject.equals(item)
    );
  }
}

const MakeActionCallback = (object, funcName) => {
  return {
    object,
    funcName,

    equals: callbackObject => {
      return (
        object === callbackObject.object && funcName === callbackObject.funcName
      );
    }
  };
};

class AppData {
  constructor() {
    this.data = {};
    Object.keys(AppDataActions).forEach(key => {
      if (key in this.data) {
        Error("duplicate key");
      }

      this.data[AppDataActions[key]] = new Data();
    });
  }

  get(key) {
    return this.data[key].data;
  }

  update(key, ...data) {
    this.data[key].update(...data);
  }

  add(key, object, funcName) {
    const callbackObject = MakeActionCallback(object, funcName);
    this.data[key].add(callbackObject);
  }

  remove(key, object, funcName) {
    const callbackObject = MakeActionCallback(object, funcName);
    this.data[key].remove(callbackObject);
  }
}

const instance = new AppData();
export default instance;
