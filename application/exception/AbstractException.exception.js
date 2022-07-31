"use strict";

/**
 * Abstract class for exception. All exceptions should inherit AbstractException.
 */
module.exports = class AbstractException extends Error {
  /**
   * Constructor.
   * @param string message Message. 
   * @param int status Status.
   * @returns void
   */
  constructor(message, status) {
    super(message)
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