(function($) {
    var chorus = window.chorus = window.chorus || {};

    $.extend(true, chorus, {
        models: {
            Collection: Backbone.Collection.extend({
                initialize: function(models, options) {
                    this.attributes = options || {};
                    this.setup(arguments);
                },

                setup: $.noop,

                url: function() {
                    return "/edc/" + Handlebars.compile(this.urlTemplate)(this.attributes);
                }
            }),
            Base: Backbone.Model.extend({
                url: function() {
                    return "/edc/" + Handlebars.compile(this.urlTemplate)(this.attributes);
                },

                parse: function(data) {
                    if (data.status == "needsLogin") {
                        chorus.session.trigger("needsLogin");
                    }
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

        },
        views: {
            Base: Backbone.View.extend(
                {
                    initialize: function initialize() {
                        this.makeModel();
                        var resource = this.model || this.collection;

                        _.bindAll(this, 'render');
                        if (resource) {
                            if (!this.persistent) resource.bind("change", this.render);
                            resource.bind("reset", this.render);
                            resource.bind("add", this.render);
                        }
                        this.setup(arguments);
                    },

                    makeModel : $.noop,
                    setup: $.noop,
                    postRender: $.noop,
                    additionalContext: $.noop,

                    context: function context() {
                        if (!this.model) return false;
                        var ctx = $.extend({},
                            this.model.attributes);
                        $.extend(ctx, this.additionalContext(ctx));
                        return ctx;
                    },

                    render: function render() {
                        $(this.el).html(this.template(this.context()))
                            .addClass(this.className)
                            .attr("title", this.options.title || this.title);
                        this.postRender($(this.el));
                        return this;
                    },

                    template: function template(content) {
                        if (!this.cachedTemplate) {
                            var tag = $('#' + this.className + "_template");
                            if (!tag.length) throw "No template for " + this.className;
                            this.cachedTemplate = Handlebars.compile(tag.html());
                        }
                        return this.cachedTemplate(content);
                    }
                })
        }
    });
})(jQuery);
