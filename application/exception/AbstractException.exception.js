"use strict";

/**
 * Abstract class for exception. All exceptions should inherit AbstractException.
 */
module.exports = class AbstractException extends Error {
  /**
   * Constructor.
   * @param string|object message Message. 
   * @param int status Status.
   * @returns void
   */
  constructor(message, status) {
    super(typeof message === "object" ? JSON.stringify(message) : message)
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.status = status;
  }

  /**
   * Return status.
   * @returns int
   */
  status() {
    return this.status;
  }
};