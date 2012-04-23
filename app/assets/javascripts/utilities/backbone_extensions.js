/*
 * Copyright (c) 2011 EMC Corporation All Rights Reserved
 *
 * This software is protected, without limitation, by copyright law
 * and international treaties. Use of this software and the intellectual
 * property contained therein is expressly limited to the terms and
 * conditions of the License Agreement under which it is provided by
 * or on behalf of EMC.
 */
var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read'  : 'GET'
};

Backbone.emulateJSON = true;

Backbone.sync = function(method, model, options) {
    method = (options && options.method) || method;

    var type = methodMap[method];

    // Default JSON-request options.
    var params = _.extend({
        type:         type,
        dataType:     'json',
        processData:  false
    }, options);

    // Ensure that we have a URL.
    if (!params.url) {
        params.url = model.url({ method: method }) || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!params.data && model && (method == 'create' || method == 'update')) {
        params.contentType = 'application/json';

        // Let the model specify its own params
        var string = JSON.stringify(model.toJSON());
        var json = $.parseJSON(string);
        _.each(json, function(property, key) {
            if (property === null) delete json[key]
        })
        params.data = $.param(json);
//      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
        params.contentType = 'application/x-www-form-urlencoded';
        params.processData = true;

        // EDC does not want the data wrapped in a model container
//      params.data        = params.data ? {model : params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
        if (type === 'PUT' || type === 'DELETE') {
            if (Backbone.emulateJSON) params.data._method = type;
            params.type = 'POST';
            params.beforeSend = function(xhr) {
                xhr.setRequestHeader('X-HTTP-Method-Override', type);
            };
        }
    }

    // Make the request.
    if (this.uploadObj && method == "create") {
        var uploadOptions = $(this.uploadObj.form).find("input[type=file]").data("fileupload").options;
        _.each(['success', 'error', 'url', 'type', 'dataType'], function(fieldName) {
            uploadOptions[fieldName] = params[fieldName];
        });
        uploadOptions.formData = json;
        return this.uploadObj.submit();
    } else {
        return $.ajax(params);
    }
};

// Unbind gets attached to the prototype of the base classes, we have to clobber it down at the bottom of this file.
Backbone.Events.unbind = function(ev, callback, context) {
    var calls;
    if (!ev) {
        this._callbacks = {};
    } else if (calls = this._callbacks) {
        if (!callback) {
            calls[ev] = [];
        } else {
            var list = calls[ev];
            if (!list) return this;
            for (var i = 0, l = list.length; i < l; i++) {
                if (list[i] && callback === list[i][0] && (context == list[i][1] || context === undefined) ) {
                    list[i] = null;
                }
            }
        }
    }
    return this;
}

// super function, taken from here:
// -- https://gist.github.com/1542120
;(function(Backbone) {

  // The super method takes two parameters: a method name
  // and an array of arguments to pass to the overridden method.
  // This is to optimize for the common case of passing 'arguments'.
  function _super(methodName, args) {

    // Keep track of how far up the prototype chain we have traversed,
    // in order to handle nested calls to _super.
    this._superCallObjects || (this._superCallObjects = {});
    var currentObject = this._superCallObjects[methodName] || this,
        parentObject  = findSuper(methodName, currentObject);
    this._superCallObjects[methodName] = parentObject;

    var result;
    if (_.isFunction(parentObject[methodName])) {
        result = parentObject[methodName].apply(this, args || []);
    } else {
        result = parentObject[methodName];
    }
    delete this._superCallObjects[methodName];
    return result;
  }

  // Find the next object up the prototype chain that has a
  // different implementation of the method.
  function findSuper(attributeName, childObject) {
    var object = childObject;
    while (object && (object[attributeName] === childObject[attributeName])) {
      object = object.constructor.__super__;
    }
    return object;
  }

  function include(/* *modules */) {
    var modules = _.toArray(arguments);
    var mergedModules = _.extend.apply(_, [{}].concat(modules));
    return this.extend(mergedModules);
  }

  _.each(["Model", "Collection", "View", "Router"], function(klass) {
    Backbone[klass].prototype._super = _super;
    Backbone[klass].prototype.unbind = Backbone.Events.unbind;
    Backbone[klass].include = include;
  });

})(Backbone);


