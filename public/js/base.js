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
                },

                parse : function(data) {
                    this.loaded = true;
                    return data.resource;
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

        },
        views: {
            Base: Backbone.View.extend(
                {
                    initialize: function initialize() {
                        this.makeModel();
                        this.resource = this.model || this.collection;

                        _.bindAll(this, 'render');
                        if (this.resource) {
                            if (!this.persistent) this.resource.bind("change", this.render);
                            this.resource.bind("reset", this.render);
                            this.resource.bind("add", this.render);
                        }
                        this.setup(arguments);
                    },

                    makeModel : $.noop,
                    setup: $.noop,
                    postRender: $.noop,
                    additionalContext: $.noop,

                    context: function context() {
                        if (!this.resource) return false;
                        var ctx = $.extend({}, this.resource.attributes);
                        ctx.loaded = this.resource.loaded;
                        if (this.collection) {
                            ctx.models = _.pluck(this.collection.models, "attributes");
                        }
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
