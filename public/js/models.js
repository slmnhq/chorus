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
                    if (!model.serverErrors) model.trigger('saved', model, resp, xhr);
                    if (success) success(model, resp, xhr);
                };
                this.serverErrors = undefined;
                if (this.performValidation(this.attributes)) {
                    return Backbone.Model.prototype.save.call(this, attrs, options);
                } else {
                    this.trigger("validationFailed");
                    return false;
                }
            },

            performValidation: function() { return true; },

            require : function(attr) {
                if (!this.get(attr)) {
                    this.errors[attr] = t("validation.required", attr);
                }
            },

            requirePattern : function(attrname, regex) {
                var attr = this.get(attrname);
                if (!attr || !attr.match(regex)) {
                    this.errors[attrname] = t("validation.required_pattern", attrname);
                }

            },

            requireConfirmation : function(attr) {
                var val = this.get(attr);
                var conf = this.get(attr + "Confirmation");

                if (!val || !conf || val != conf) {
                    this.errors[attr] = t("validation.confirmation", attr);
                }
            },

            setMaxLength : function(attrname, size) {
                var attr = this.get(attrname);
                if (attr && attr.length > size) {
                    this.errors[attrname] = t("validation.max_length", attrname);
                }
            }
        })
    }
})(jQuery);
