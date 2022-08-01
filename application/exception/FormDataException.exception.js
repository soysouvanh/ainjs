"use strict";

const AbstractException = require(__dirname + "/AbstractException.exception.js");

/**
 * Form data exception occurs when a data field is not expected.
 */
module.exports = class FormDataException extends AbstractException {
  /**
   * Constructor.
   * @param string|object message (optional) Message.
   */
  constructor(message) {
    super(message === undefined || message === null ? "Precondition Failed" : message, 412);
  }
};