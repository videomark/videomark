class MainVideoChangeException extends Error {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MainVideoChangeException);
    }

    this.name = "MainVideoChangeException";
  }
}
export default MainVideoChangeException;
