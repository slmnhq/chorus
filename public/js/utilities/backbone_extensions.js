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
    var type = methodMap[method];

    // Default JSON-request options.
    var params = _.extend({
        type:         type,
        dataType:     'json',
        processData:  false
    }, options);

    // Ensure that we have a URL.
    if (!params.url) {
        params.url = model.url() || urlError();
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
        uploadOptions.success = params.success;
        uploadOptions.error = params.error;
        uploadOptions.url = params.url;
        uploadOptions.type = params.type;
        uploadOptions.formData = json;

        return this.uploadObj.submit();
    } else {
        return $.ajax(params);
    }
};

// super function, taken from here:
// -- http://forrst.com/posts/Backbone_js_super_function-4co
Backbone.Collection.prototype._super = Backbone.Model.prototype._super = Backbone.View.prototype._super = function(methodName) {
    var superPrototype = this;
    while (superPrototype._superCalled) {
        superPrototype = superPrototype.constructor.__super__;
    }
    superPrototype._superCalled = true;

    var result = superPrototype[methodName].apply(this, Array.prototype.slice.call(arguments, 1));

    delete superPrototype._superCalled;
    return result;
}
