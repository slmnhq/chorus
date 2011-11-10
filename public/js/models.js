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

            parse: function(data) {
                if (data.status == "needlogin") {
                    chorus.session.trigger("needsLogin");
                }
                this.loaded = true;
                if (data.status == "ok") {
                    return data.resource[0]
                } else {
                    return {
                        errors: data.message
                    };
                }
            },

            save : function(attrs, options) {
                options || (options = {});
                var success = options.success;
                options.success = function(model, resp, xhr) {
                    if (!model.get("errors")) model.trigger('saved', model, resp, xhr);
                    if (success) success(model, resp, xhr);
                };
                this.unset("errors", { silent: true });
                return Backbone.Model.prototype.save.call(this, attrs, options);
            }
        })
    }
})(jQuery);
