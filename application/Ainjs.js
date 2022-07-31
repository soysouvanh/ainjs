"use strict";

// Define global constants
const gc = {
  // Start measure execution time
  HR_START: process.hrtime(),

  // Paths
  ASPECT_PATH: __dirname + "/aspect",
  FIELD_PATH: __dirname + "/field",
  EXCEPTION_PATH: __dirname + "/exception",
  FORM_PATH: __dirname + "/form",
  METADATA_PATH: __dirname + "/metadata",
  MODEL_PATH: __dirname + "/model",
  PUBLIC_PATH: __dirname + "/../public",
  TEMPLATE_PATH: __dirname + "/template",

  CSS_VIEW_PATH: __dirname + "/view/css",
  DIALOG_VIEW_PATH: __dirname + "/view/dialog",
  EVENT_VIEW_PATH: __dirname + "/view/event",
  JS_VIEW_PATH: __dirname + "/view/js",
  PAGE_VIEW_PATH: __dirname + "/view/page",
  WS_VIEW_PATH: __dirname + "/view/ws",

  // Extension files
  ASPECT_EXTENSION_FILE: ".aspect.js",
  CSS_EXTENSION_FILE: ".css",
  FIELD_EXTENSION_FILE: ".field.js",
  EXCEPTION_EXTENSION_FILE: ".exception.js",
  FORM_EXTENSION_FILE: ".form.js",
  JS_EXTENSION_FILE: ".js",
  METADATA_EXTENSION_FILE: ".metadata.js",
  MODEL_EXTENSION_FILE: ".model.js",
  TEMPLATE_EXTENSION_FILE: ".template.ejs",

  CSS_VIEW_EXTENSION_FILE: ".css.ejs",
  DIALOG_VIEW_EXTENSION_FILE: ".dialog.ejs",
  EVENT_VIEW_EXTENSION_FILE: ".event.ejs",
  FOOTER_VIEW_EXTENSION_FILE: ".footer.ejs",
  HEADER_VIEW_EXTENSION_FILE: ".header.ejs",
  JS_VIEW_EXTENSION_FILE: ".js.ejs",
  MENU_VIEW_EXTENSION_FILE: ".menu.ejs",
  PAGE_VIEW_EXTENSION_FILE: ".page.ejs",
  WS_VIEW_EXTENSION_FILE: ".ws.ejs",

  // Instances
  fs: null,
  cache: null,
  ejs: null,

  // Mime types: full list can be found in https://developer.mozilla.org/fr/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  MIME_TYPE: {
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    json: "application/json",
    csv: "text/csv",
    xml: "application/xml",

    ico: "image/x-icon",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",

    mp3: "audio/mpeg",
    
    pdf: "application/pdf",
    
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    
    zip: "application/zip",
    "7z":	"application/x-7z-compressed"
  }
};

// Define global classes
let AbstractException = null,
  FormDataException = null,
  InternalServerErrorException = null,
  NotFoundException = null;

// Catch uncaught exceptions
process.on("uncaughtException", err => {
  const dateTime = new Date().toISOString();
  gc.fs.appendFile(
    __dirname + "/../log/error-" + dateTime.slice(0, 10).replace(/-/g, "") + ".log.txt",
    dateTime.replace(/\..+$/g, "") + " " + err.stack + "\n",
    (err) => {
      // Case uncaughtException: end process
      if(gc.response === null) {
        // End process as soon as possible
        process.exit(1);
      }
    }
  );
  
  // End process as soon as possible
  console.log("UncaughtException: end process. " + err.stack);
});

module.exports = class Ainjs {
  /**
   * Constructor.
   * Initialize attributes.
   * @param object arguments:
   *    - object http HTTP instance.
   *    - object request Request instance.
   *    - object response Response instance.
   *    - string template Template name. "default" by default.
   * @returns void
   */
  constructor(args) {
    // Initialize attributes
    for(const name in args) {
      this[name] = args[name];
    }

    // Set resource attributes
    const parsedUrl = this.parseUrl(this.request.url);
    this.path = parsedUrl.path;
    this.resourceName = parsedUrl.resourceName;
    this.uri = parsedUrl.uri;
    this.modelName = parsedUrl.modelName;
    this.actionName = parsedUrl.actionName;
    this.requestType = parsedUrl.requestType;
    this.parameters = parsedUrl.parameters;
    this.view = {};
  }

  /**
   * Parse URL and return object containing path, resource name and request type.
   * @param string url URL. 
   * @returns object {path: <resource path with ending "/">, resourceName: <resourceName>, requestType: <page|event|dialog|ws>}
   */
  parseUrl(url) {
    // Determine request type
    let parsedUrl = require("url").parse(this.request.url, true),
      t = parsedUrl.pathname.split(","),
      requestType = t.length > 1 ? t[1] : "page",
      modelSuffix = requestType !== "page" ? requestType[0].toUpperCase() + requestType.slice(1) : "";
    
    // Initialize default parsed URL
    parsedUrl = {
      path: "/",
      resourceName: "index",
      uri: t[0],
      modelName: "Index" + modelSuffix,
      actionName: "index",
      requestType: requestType,
      parameters: Object.entries(parsedUrl.query).length === 0 ? null : parsedUrl.query
    };

    // Case index resource
    if(t[0][t[0].length - 1] === "/") {
      parsedUrl.path = t[0];
      return parsedUrl;
    }

    // Case other resource: update parsed URL
    t = t[0].split("/");
    parsedUrl.resourceName = t.pop();
    parsedUrl.actionName = this.toCamelCase(parsedUrl.resourceName);
    if(t.length > 2) {
      parsedUrl.modelName = this.toPascalCase(t.pop()) + modelSuffix;
    }
    if(t.length > 0) {
      parsedUrl.path += t.join("/");
    }

    // Return parsed URL
    return parsedUrl;
  }

  /**
   * Convert a string to Pascal case.
   * @param string String. 
   * @returns string
   */
   toPascalCase(string) {
    // Convert accentued characters to non accentued characters
    string = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Convert non alphanumeric to space and retrieve words
    let words = string.replace(/[^a-zA-Z\d]+/g, " ").split(" "),
      count = words.length;

    // Upper case first character of each word
    for(let i = 0; i < count; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].slice(1);
    }

    // Return Pascal case
    return words.join("");
  }

  /**
   * Convert a string to Camel case.
   * @param string string 
   * @returns string
   */
  toCamelCase(string) {
    // Convert string to Pascal case
    string = this.toPascalCase(string);

    // Return Camel case
    return string[0].toLowerCase() + string.slice(1);
  }

  /**
   * Load this.formData in synchronous process and put in cache.
   * @param string uri URI.
   * @param string requestType Request type: page, event, dialog, ws.
   * @returns object
   */
  async getFormData(uri, requestType) {
    // Retrieve form data from cache
    const formDataFileName = gc.FORM_PATH + uri + "." + requestType + gc.FORM_EXTENSION_FILE;
    gc.cache.del(formDataFileName);
    let formData = gc.cache.get(formDataFileName);
    
    // Case form data does not exist in cache
    if(formData === undefined) {
        let fieldNames = null;
        try {
          // Load fields list: request parameters list
          fieldNames = require(formDataFileName);
        } catch(e) {
          // Request has no parameter
          return null;
        }

        // Initialize form data
        formData = {};

        // Load fields asynchronously
        let requires = [];
        for(const fieldName of fieldNames) {
          requires.push(new Promise((resolve, reject) => {resolve(require(gc.FIELD_PATH + "/" + fieldName + gc.FIELD_EXTENSION_FILE))}));
        }
        requires = await Promise.all(requires);
        
        // Build form data
        const n = requires.length;
        for(let i = 0; i < n; i++) {
          formData[fieldNames[i]] = requires[i];
        };
        
        // Store form data in cache
        gc.cache.set(formDataFileName, formData);
    }
    
    // Return form data
    return formData;
  }

  /**
   * Return require content if found, othewise defaultValue.
   * @param string fileName File name.
   * @param {*} defaultValue (optional) Default value if not found. null by default.
   * @returns null|object|array
   */
  getRequireContent(fileName, defaultValue) {
    try {
      // Return require content
      return require(fileName);
    } catch(e) {
      // No content by default
    }

    // Return default value
    return defaultValue === undefined ? null : defaultValue;
  }

  /**
   * Return file content if found, othewise defaultValue.
   * @param string fileName File name.
   * @param {*} defaultValue (optional) Default value if not found. null by default.
   * @returns null|string
   */
  getFileContent(fileName, defaultValue) {
    try {
      // Return file content
      return gc.fs.readFileSync(fileName).toString();
    } catch(e) {
      // No content by default
    }

    // Return default value
    return defaultValue === undefined ? null : defaultValue;
  }

  getPageElement(uri, fileExtension) {
    // Return page element (header, footer or menu) if found
    let content = this.getFileContent(uri + fileExtension);
    if(content !== null) {
      return content;
    }

    // Return page default of the sub folders
    let t = uri.split("/");
    while(t.length > 2) {
      t.pop();
      content = this.getFileContent(gc.PAGE_VIEW_PATH + t.join("/") + "/default" + fileExtension);
      if(content !== null) {
        return content;
      }
    }

    // Return default content: this content must exist
    return gc.fs.readFileSync(gc.PAGE_VIEW_PATH + "/default" + fileExtension).toString();
  }

  /**
   * Return page breadcrumb content.
   * @param string uri URI.
   * @returns string
   */
  getPageBreadcrumb(uri) {
    return "";
  }

  /**
   * Throw exception.
   * @param string|AbstractException name Exception name. Exception must exists in /exception folder (ex: FormDataException).
   * @param string message (optional) Exception message. undefined by default.
   * @returns void
   * @throws AbstractException
   */
  throwException(name, message) {
    const exceptionClass = name instanceof AbstractException
      ? name
      : require(gc.EXCEPTION_PATH + "/" + name + gc.EXCEPTION_EXTENSION_FILE);
    throw new exceptionClass(message);
  }

  /**
   * Check request parameters.
   * @param object parameters (optional) Request parameters. this.paremeters by default.
   * @param object formData (optional) Form data. this.formData by default.
   * @param string redirectUrl (optional) Redirect URL on error. undefined by default.
   * @returns void
   * @throws FormDataException
   */
  checkParameters(parameters, formData, redirectUrl) {
    // Initialize method arguments
    if(parameters === undefined) {
      parameters = this.parameters;
    }
    if(formData === undefined) {
      formData = this.formData;
    }
    
    try {
      //Loop on form data
      for(const fieldName in formData) {
        // Retrieve field field
        const field = formData[fieldName],
          label = field.title === null ? field.label : field.title;
        
        // Case parameter exists
        if(parameters[fieldName] !== undefined) {
          // Case array value from select, checkbox
          // Case string value (by default) from input, textarea, radio
          const values = typeof parameters[fieldName] === "object" 
            ? (
                typeof field.defaultValue === "object"
                  ? field.defaultValue
                  : [field.defaultValue]
              )
            : [parameters[fieldName]];
          
          //Loop on values
          for(let value of values) {
            // Clean value: string by default
            value = value.trim();
            
            // Check required value
            if(field.required.value && value === "") {
              // Case no default value
              if(field.defaultValue === null) {
                throw new FormDataException(JSON.stringify({fieldId: fieldName, type: "required", message: field.required.message, label: label}));
              }

              // Set default value
              parameters[fieldName] = value = field.defaultValue;
            }

            // Check length and format
            const length = ("" + value).length;
            if(length > 0) {
              // Check miunimum length
              if(field.minLength.value > 0 && length < field.minLength.value) {
                throw new FormDataException(JSON.stringify({fieldId: fieldName, type: "minLength", message: field.minLength.message, label: label}));
              }

              // Check maximum length
              if(field.maxLength.value > 0 && length > field.maxLength.value) {
                throw new FormDataException(JSON.stringify({fieldId: fieldName, type: "maxLength", message: field.maxLength.message, label: label}));
              }

              // Check format
              if(field.format.value !== null) {
                  if(!field.format.value.test(value)) {
                    throw new FormDataException(JSON.stringify({fieldId: fieldName, type: "format", message: field.format.message, label: label}));
                  }
              }
              
              // Check select: field.values should not be empty
              if(field.type === "select" && field.values !== null) {
                // Case select key not found with value string type by default
                if(field.values[value] === undefined) {
                  throw new FormDataException(JSON.stringify({fieldId: fieldName, type: "format", message: field.format.message, label: label}));
                }
              }

              // Check number: min and max
              else if(field.type === "number") {
                //Cast value to int or decimal: int by default
                parameters[fieldName] = value = field.step === null || !/[\.]/.test(field.step) ? parseInt(value, 10) : parseFloat(value);

                // Case min exists
                if(field.min.value !== null && value < field.min.value) {
                  throw new FormDataException(JSON.stringify({fieldId: fieldName, type: "min", message: field.min.message, label: label}));
                }

                // Case max exists
                if(field.max.value !== null && value < field.max.value) {
                  throw new FormDataException(JSON.stringify({fieldId: fieldName, type: "max", message: field.max.message, label: label}));
                }
              }
            }
          }
        }

        // Case parameter is not set
        else {
          parameters[fieldName] = null;
        }
        
        // Case parameter is not set or is empty
        if(parameters[fieldName] === null || parameters[fieldName] === "") {
          // Set parameter with default value
          parameters[fieldName] = field.defaultValue;
          
          // Case required parameter
          if(field.required.value) {
            // Case no default value
            if(field.type === 'checkbox' || field.defaultValue === null) {
              throw new FormDataException(JSON.stringify({fieldId: fieldName, type: "required", message: field.required.message, label: label}));
            }
          }
        }
      }
    } catch(e) {
      // Case no redirect URL, throw exception
      if(redirectUrl === undefined || redirectUrl === null) {
        throw e;
      }
      
      // On error, redirect URL
      this.response.redirect(301, redirectUrl);
    }
  }

  async getPageView(pageView) {
    // Retrieve form data, model class, aspects list
    const [templateView, pageCriticalCss, pageCss, pageJs, pageHeader, pageMenu, pageFooter, pageBreadcrumb, metadata] = await Promise.all([
      this.getFileContent(gc.TEMPLATE_PATH + "/" + this.template + gc.TEMPLATE_EXTENSION_FILE),
      this.getFileContent(gc.PUBLIC_PATH + "/critical" + gc.CSS_EXTENSION_FILE, ""),
      this.getFileContent(gc.CSS_VIEW_PATH + this.uri + "." + this.requestType + gc.CSS_VIEW_EXTENSION_FILE, ""),
      this.getFileContent(gc.JS_VIEW_PATH + this.uri + "." + this.requestType + gc.JS_VIEW_EXTENSION_FILE, ""),
      this.getPageElement(this.uri, gc.HEADER_VIEW_EXTENSION_FILE),
      this.getPageElement(this.uri, gc.MENU_VIEW_EXTENSION_FILE),
      this.getPageElement(this.uri, gc.FOOTER_VIEW_EXTENSION_FILE),
      this.getPageBreadcrumb(this.uri),
      this.getRequireContent(gc.METADATA_PATH + this.uri + gc.METADATA_EXTENSION_FILE, {
        title: "",
        navigation: "",
        description: "",
        keywords: "",
        author: AUTHOR,
        compression: true,
        static: true,
        expiry: 0,
        cache: 0,
        canonical: this.uri
      })
    ]);
    
    // Set view data
    this.view.pageBody = pageView;
    this.view.pageCriticalCss = pageCriticalCss;
    this.view.pageCss = pageCss;
    this.view.pageJs = pageJs;
    this.view.pageHeader = pageHeader;
    this.view.pageMenu = pageMenu;
    this.view.pageFooter = pageFooter;
    this.view.pageBreadcrumb = pageBreadcrumb;
    this.view.metadata = metadata;

    // Return template view
    return templateView;
  }

  /**
   * Render page on success.
   * @returns void
   */
  async renderOnSuccessPage() {
    // Load page view
    this.getPageView(this.pageView).then((pageView) => {
      // Set response status and content type
      this.response.writeHead(200, {"Content-Type": "text/html"});

      // Set response content
      this.response.write(gc.ejs.render(pageView, this.view));
      this.response.end();
    });
  }

  /**
   * Render page on error.
   * @param AbstractException exception Exception.
   * @returns void
   */
  async renderOnErrorPage(exception) {
    // Load page view
    this.uri = exception instanceof NotFoundException ? "/not-found" : "/internal-server-error";
    this.getPageView(this.getFileContent(gc.PAGE_VIEW_PATH + this.uri + gc.PAGE_VIEW_EXTENSION_FILE)).then((pageView) => {
      // Set response status and content type
      this.response.writeHead(exception.status, {"Content-Type": "text/html"});

      // Set response content
      this.response.write(gc.ejs.render(pageView, this.view));
      this.response.end();
    });
  }

  /**
   * Render event on success.
   * @returns void
   */
  async renderOnSuccessEvent() {
    // Set response status and content type
    this.response.writeHead(200, {"Content-Type": this.pageView !== null || this.pageView[0] === "<" ? "text/html" : (this.pageView[0] === "{" ? "application/json" : "application/javascript")});

    // Set response content
    this.response.write(gc.ejs.render(this.pageView, this.view));
    this.response.end();
  }

  /**
   * Render event on error.
   * @param AbstractException exception Exception.
   * @returns void
   */
  async renderOnErrorEvent(exception) {
    // Set response status and content type
    this.response.writeHead(exception.status, {"Content-Type": exception.message === null || exception.message === "" || exception.message[0] === "<" ? "text/html" : (exception.message[0] === "{" ? "application/json" : "application/javascript")});

    // Set response content
    this.response.write(exception.message);
    this.response.end();
  }

  /**
   * Render dialog on success.
   * @returns void
   */
  async renderOnSuccessDialog() {
    // Set response status and content type
    this.response.writeHead(200, {"Content-Type": "text/html"});

    // Set response content
    this.response.write(gc.ejs.render(this.pageView, this.view));
    this.response.end();
  }

  /**
   * Render dialog on error.
   * @param AbstractException exception Exception.
   * @returns void
   */
  async renderOnErrorDialog(exception) {
    // Set response status and content type
    this.response.writeHead(exception.status, {"Content-Type": "text/html"});

    // Set response content
    this.uri = exception instanceof NotFoundException ? "/not-found" : "/internal-server-error";
    this.response.write(gc.ejs.render(this.getFileContent(gc.DIALOG_VIEW_PATH + this.uri + gc.DIALOG_VIEW_EXTENSION_FILE), this.view));
    this.response.end();
}

  /**
   * Render web service on error.
   * @returns void
   */
  async renderOnSuccessWs() {
    console.log("trace renderOnSuccessWs");
    // Set response status and content type
    const format = this.parameters.format === undefined || this.parameters.format === null || gc.MIME_TYPE[this.parameters.format] === undefined ? "json" : this.parameters.format;
    this.response.writeHead(200, {"Content-Type":  gc.MIME_TYPE[format]});
    
    // Build response
    // Case page view exists
    let response = null;
    if(this.pageView !== null) {
        // Case view data exist
        if(Object.entries(this.view).length > 0) {
          // Build response with page view and view data
          response = gc.ejs.render(this.pageView, this.view);
        }

        // Case by default
        else {
          // Set response with page view by default
          response = this.pageView;
        }
    }

    // Case page view does not exist
    else {
      // Build default response with view data
      const viewType = typeof this.view;
      response = JSON.stringify({
        uri: this.uri + "," + this.requestType,
        parameters: this.parameters,
        duration: process.hrtime(gc.HR_START)[1] / 1000000,
        data: viewType === "object"
          ? this.view
          : (viewType === "string" && this.view[0] === "{") ? JSON.parse(this.view) : this.view
      });
    }

    // Case response into XML
    if(format === "xml") {
      // Convert object to XML string
      const builder = new (require("xml2js")).Builder();
      response = builder.buildObject(JSON.parse(response));
    }

    // Set response content
    this.response.write(response);
    this.response.end();
  }

  /**
   * Render web service on error.
   * @param AbstractException exception Exception.
   * @returns void
   */
  async renderOnErrorWs(exception) {
    console.log("trace renderOnErrorWs");
    // Set response status and content type
    const format = this.parameters.format === undefined || this.parameters.format === null || gc.MIME_TYPE[this.parameters.format] === undefined ? "json" : this.parameters.format;
    this.response.writeHead(exception.status, {"Content-Type":  gc.MIME_TYPE[format]});

    // Build response
    // Case error page view exists
    const message = JSON.stringify({
      uri: this.uri + "," + this.requestType,
      parameters: this.parameters,
      duration: process.hrtime(gc.HR_START)[1] / 1000000,
      data: {
        status: exception.status,
        message: this.http.STATUS_CODES[exception.status]
      }
    });
    this.uri = exception instanceof NotFoundException ? "/not-found" : "/internal-server-error";
    let response = this.getFileContent(gc.WS_VIEW_PATH + this.uri + gc.WS_VIEW_EXTENSION_FILE);
    if(response !== null) {
      // Set response view if not exists
      if(this.view.response === undefined) {
        this.view.response = message;
      }
      
      // Build response with page view and view data
      response = gc.ejs.render(response, this.view);
    }
    
    // Case error page view does not exist
    else {
      // Build default response
      response = message;
    }

    // Case response into XML
    if(format === "xml") {
      // Convert object to XML string
      const builder = new (require("xml2js")).Builder();
      response = builder.buildObject(JSON.parse(response));
    }

    // Set response content
    this.response.write(response);
    this.response.end();
  }

  /**
   * Log message.
   * @param string|Exception exception Message to log.
   * @returns void
   */
  async log(exception) {
    // Determine current date and time
    const dateTime = new Date().toISOString();

    // Log error in file
    gc.fs.appendFile(
      __dirname + "/../log/error-" + dateTime.slice(0, 10).replace(/-/g, "") + ".log.txt",
      dateTime.replace(/\..+$/g, "") + " " + exception.stack + "\n",
      (err) => {
        //if(err) {
        //  console.log(err);
        //}
      }
    );
  }

  /**
   * Return mime types.
   * @returns object
   */
  static getMimeTypes() {
    return gc.MIME_TYPE;
  }

  /**
   * Launch request. It is the entry point of the Aspect-Oriented process.
   * @returns void
   */
  async run() {
    // Case static resource
    const t = this.uri.split(".");
    if(t.length > 1) {
      // Case file extension found
      const contentType = gc.MIME_TYPE[t[t.length - 1]];
      if(contentType !== undefined) {
        // Read file from file system
        gc.fs.readFile(__dirname + "/../public" + this.uri, (err, data) => {
          // Case error
          if(err) {
            this.response.writeHead(404, {"Content-Type": contentType});
            this.response.end(this.http.STATUS_CODES[404]);
            return;
          }

          // Case file found
          this.response.writeHead(200, {"Content-type": contentType});
          this.response.end(data);
        });
      }

      // Case file extension unfound
      else {
        this.response.writeHead(404, {"Content-Type": gc.MIME_TYPE.html});
        this.response.end(this.http.STATUS_CODES[404]);
      }

      return;
    }

    // Case dynamic resource
    // Complete global constants and classes
    const [fs, cache, ejs, AbstractExceptionClass, FormDataExceptionClass, InternalServerErrorExceptionClass, NotFoundExceptionClass] = await Promise.all([
        require("fs"),
        new (require("node-cache"))(),
        require("ejs"),
        require(gc.EXCEPTION_PATH + "/AbstractException" + gc.EXCEPTION_EXTENSION_FILE),
        require(gc.EXCEPTION_PATH + "/FormDataException" + gc.EXCEPTION_EXTENSION_FILE),
        require(gc.EXCEPTION_PATH + "/InternalServerErrorException" + gc.EXCEPTION_EXTENSION_FILE),
        require(gc.EXCEPTION_PATH + "/NotFoundException" + gc.EXCEPTION_EXTENSION_FILE)
      ]);
    gc.fs = fs;
    gc.cache = cache;
    gc.ejs = ejs;
    AbstractException = AbstractExceptionClass;
    FormDataException = FormDataExceptionClass;
    InternalServerErrorException = InternalServerErrorExceptionClass;
    NotFoundException = NotFoundExceptionClass;
    
    // Retrieve form data, model class, aspects list and page view
    const viewPrefix = this.requestType.toUpperCase(),
      [formData, modelClass, aspects, pageView] = await Promise.all([
        this.getFormData(this.uri, this.requestType),
        this.getRequireContent(gc.MODEL_PATH + this.path + this.modelName + gc.MODEL_EXTENSION_FILE),
        this.getRequireContent(gc.ASPECT_PATH + this.uri + "." + this.requestType + gc.ASPECT_EXTENSION_FILE, []),
        this.getFileContent(gc[viewPrefix + "_VIEW_PATH"] + this.uri + gc[viewPrefix + "_VIEW_EXTENSION_FILE"])
      ]);
    
    // Set resource attributes
    this.formData = formData;
    this.model = modelClass === null ? null : new modelClass(this);
    if(aspects.length === 0 && this.model !== null && this.model[this.actionName] !== undefined) {
      aspects = [{
        methodName: "this.model." + this.actionName,
        arguments: null
      }];
    }

    try {
      // Case no view and not ws request type
      if(pageView === null && this.requestType !== "ws") {
        throw new NotFoundException(this.requestType === "page" ? this.uri : this.uri + "," + this.requestType);
      }

      // Set page view
      this.pageView = pageView;

      // Run aspects : an aspect can call aojs method (this.xxx) and/or model method (this.model.xxx)
      for(const aspect of aspects) {
        // Execute aspect
        eval(aspect.methodName + (aspect.arguments === undefined || aspect.arguments === null || aspect.arguments === [] ? "()" : "(...aspect.arguments)"));
      }
      
      // Render on success
      this["renderOnSuccess" + this.requestType[0].toUpperCase() + this.requestType.slice(1)]();
    } catch(exception) {
      // Case not FormDataException
      if(!(exception instanceof FormDataException)) {
        // Log error
        this.log(exception);

        // Case unknown error
        if(!(exception instanceof AbstractException)) {
          exception = new InternalServerErrorException(this.http.STATUS_CODES[500]);
        }
      }

      // Render on error
      this["renderOnError" + this.requestType[0].toUpperCase() + this.requestType.slice(1)](exception);
    }
  }
};