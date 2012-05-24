;(function() {
    window.stubFileUpload = function(el) {
        return new FakeFileUpload(el);
    };

    function FakeFileUpload(fileInputElement) {
        var self = this;
        spyOn($.fn, 'fileupload').andCallFake(function(uploadOptions) {
            self.options = uploadOptions;
        });
    }

    _.extend(FakeFileUpload.prototype, {
        add: function(filenames) {
            var self = this;
            this.files = _.map(filenames, function(name) {
                return {
                    name: name,
                    size: 1234,
                    type: "text/plain"
                };
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
            this.options.fail(this.fakeEvent(), {
                jqXHR: {
                    responseText: JSON.stringify(bodyJson)
                }
            })
        }
    });
})();
