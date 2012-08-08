(function() {
    window.stubFileUpload = function(el) {
        return new FakeFileUpload(el);
    };

    function FakeFileUpload() {
        var self = this;
        spyOn($.fn, 'fileupload').andCallFake(function(uploadOptions) {
            self.options = uploadOptions;
            if(uploadOptions.type == "PUT") {
                throw("The HTTP PUT method will break in Internet Explorer 9!");
            }
        });
    }

    _.extend(FakeFileUpload.prototype, {
        add: function(files) {
            var self = this;
            this.files = _.map(files, function(file) {
                if(_.isObject(file)) {
                    return {
                        name: file.name,
                        size: file.size || 1234,
                        type: file.type || "text/plain"
                    };
                } else {
                    return {
                        name: file,
                        size: 1234,
                        type: "text/plain"
                    };
                }
            });

            this.options.add(this.fakeEvent(), {
                files: self.files,
                submit: function() {
                    self.wasSubmitted = true;
                    return self.fakeRequest();
                }
            });
        },

        fakeEvent: function() {
            return { preventDefault: $.noop };
        },

        fakeRequest: function() {
            var self = this;
            return {
                abort: function() {
                    self.wasAborted = true;
                }
            };
        },

        succeed: function(bodyJson) {
            this.options.done({}, {
                result: JSON.stringify(bodyJson)
            });
        },

        fail: function(bodyJson) {
            var bodyText = JSON.stringify(bodyJson);
            this.options.fail(this.fakeEvent(), {
                jqXHR: {
                    responseText: bodyText
                },

                result: bodyText
            });
        },

        HTTPResponseFail: function(bodyText, status, statusText) {
            this.options.fail(this.fakeEvent(), {
                jqXHR: {
                    status: status || 404,
                    statusText: statusText || "FakeUpload doesn't like what you sent",
                    responseText: bodyText
                },

                result: bodyText
            });
        },
    });
})();
