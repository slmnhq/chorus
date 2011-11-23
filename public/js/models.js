(function($) {
    chorus.models = {
        Collection: Backbone.Collection.extend({
            initialize: function(models, options) {
                this.attributes = options || {};
                this.setup(arguments);
            },

            setup: $.noop,

            url: function() {
                return "/edc/" + Handlebars.compile(this.urlTemplate)(this.attributes);
            },

            parse : function(data) {
                if (data.status == "needlogin") {
                    chorus.session.trigger("needsLogin");
                }
                this.loaded = true;
                return data.resource;
            }
        }),

        Base: Backbone.Model.extend({
            url: function() {
                return "/edc/" + Handlebars.compile(this.urlTemplate)(this.attributes);
            },

            showUrl: function() {
                if (!this.showUrlTemplate) {
                    throw "No showUrlTemplate defined";
                }

                return "#/" + Handlebars.compile(this.showUrlTemplate)(this.attributes);
            },

            parse: function(data) {
                if (data.status == "needlogin") {
                    chorus.session.trigger("needsLogin");
                }
                this.loaded = true;
                if (data.status == "ok") {
                    return data.resource[0]
                } else {
                    this.serverErrors = data.message;
                }
            },

            save : function(attrs, options) {
                options || (options = {});
                var success = options.success;
                options.success = function(model, resp, xhr) {
                    var savedEvent = model.serverErrors ? "saveFailed" : "saved"
                    model.trigger(savedEvent, model, resp, xhr);
                    if (success) success(model, resp, xhr);
                };
                this.serverErrors = undefined;
                if (this.performValidation(this.attributes)) {
                    this.trigger("validated");
                    return Backbone.Model.prototype.save.call(this, attrs, options);
                } else {
                    this.trigger("validationFailed");
                    return false;
                }
            },

            destroy : function(options) {
                console.log("destroying...", this, options)
                options || (options = {});
                if (this.isNew()) return this.trigger('destroy', this, this.collection, options);
                var model = this;
                var success = options.success;
                options.success = function(resp) {
                    console.log("success", resp)
                    if (resp.status != "ok") {
                        model.trigger('destroyFailed', model, model.collection, options);
                    }
                };
                return Backbone.Model.prototype.destroy.call(this, options);
            },

            performValidation: function() {
                return true;
            },

            require : function(attr) {
                if (!this.get(attr)) {
                    this.errors[attr] = t("validation.required", this._textForAttr(attr));
                }
            },

            requirePattern : function(attr, regex) {
                var value = this.get(attr);
                if (!value || !value.match(regex)) {
                    this.errors[attr] = t("validation.required_pattern", this._textForAttr(attr));
                }
            },

            requireConfirmation : function(attr) {
                var value = this.get(attr);
                var conf = this.get(attr + "Confirmation");

                if (!value || !conf || value != conf) {
                    this.errors[attr] = t("validation.confirmation", this._textForAttr(attr));
                }
            },

            _textForAttr : function(attr) {
                return (this.attrToLabel && this.attrToLabel[attr]) ? t(this.attrToLabel[attr]) : attr;
            }
        })
    }
})(jQuery);
