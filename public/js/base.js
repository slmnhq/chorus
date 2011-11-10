(function($) {
    var chorus = window.chorus = window.chorus || {};


    var viewExtensions = Backbone.View.extend({
        initialize: function initialize() {
            this.preInitialize();
            _.bindAll(this, 'render');
            this.bindCallbacks()
            this.setup(arguments);
        },

        preInitialize : $.noop,
        setup: $.noop,
        postRender: $.noop,
        bindCallbacks: $.noop,

        context : function() {
            return {}
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

        },

        views: {
            Base : viewExtensions.extend({
                makeModel : $.noop,
                additionalContext: $.noop,

                preInitialize : function() {
                    this.makeModel();
                    this.resource = this.model || this.collection;

                },

                bindCallbacks : function() {
                    if (this.resource) {
                        if (!this.persistent) this.resource.bind("change", this.render);
                        this.resource.bind("reset", this.render);
                        this.resource.bind("add", this.render);
                    }
                },

                context: function context() {
                    if (!this.resource) return false;
                    var ctx = $.extend({}, this.resource.attributes);
                    ctx.loaded = this.resource.loaded;
                    if (this.collection) {
                        ctx.models = _.pluck(this.collection.models, "attributes");
                    }
                    $.extend(ctx, this.additionalContext(ctx));
                    return ctx;
                }
            })
        },


        pages : {
            Base : viewExtensions.extend({
                className : "logged_in_layout",

                bindCallbacks: function() {
                    chorus.user.bind("change", this.render);
                },

                postRender : function() {
                    this.header = this.header || new chorus.views.Header();
                    this.header.el = this.$("#header");
                    this.header.delegateEvents();
                    this.header.render();

                    this.mainContent.el = this.$("#main_content");
                    this.mainContent.delegateEvents();
                    this.mainContent.render();

                    this.breadcrumbs = new chorus.views.BreadcrumbsView({breadcrumbs: this.crumbs })
                    this.breadcrumbs.el = this.$("#breadcrumbs")
                    this.breadcrumbs.delegateEvents();
                    this.breadcrumbs.render();

                    //do we make a default sidebar?
                    if (this.sidebar) {
                        this.sidebar.el = this.$("#sidebar")
                        this.sidebar.delegateEvents()
                        this.sidebar.render();
                    }
                }
            }),
            Bare : viewExtensions.extend({
                bindCallbacks: function() {
                    if (chorus.user) chorus.user.bind("change", this.render);
                }
            })
        }
    });


    chorus.views.MainContentView = chorus.views.Base.extend({
        className : "main_content",

        postRender : function() {
            this.contentHeader.el = this.$("#content_header");
            this.contentHeader.delegateEvents();
            this.contentHeader.render();

            if (this.contentDetails) {
                this.contentDetails.el = this.$("#content_details");
                this.contentDetails.delegateEvents();
                this.contentDetails.render();
            }

            this.content.el = this.$("#content");
            this.content.delegateEvents();
            this.content.render();
        }
    })


})(jQuery);
