"use strict";

module.exports = class IndexEvent {
  /**
   * Index event module.
   * @param AO ao Aspect oriented instance.
   * @returns void
   */
  constructor(ao) {
    this.ao = ao;
  }

  /**
   * Check login: email and password.
   * @returns void
   * @throws FormDataException
   */
  login() {
    console.log("trace login: " + __filename);
  }
};