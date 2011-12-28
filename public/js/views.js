;
(function(ns) {
    ns.Bare = Backbone.View.extend(_.extend({}, chorus.Mixins.Events, {
        initialize: function initialize() {
            this.preInitialize.apply(this, arguments);
            _.bindAll(this, 'render');
            this.bindCallbacks()
            this.setup.apply(this, arguments);
        },

        preInitialize : $.noop,
        setup: $.noop,
        postRender: $.noop,
        bindCallbacks: $.noop,
        preRender: $.noop,
        setupSubviews : $.noop,

        context : {},
        subviews : {},

        render: function render() {
            this.preRender($(this.el));

            var evaluatedContext = _.isFunction(this.context) ? this.context() : this.context;
            $(this.el).html(this.template(evaluatedContext))
                .addClass(this.className)
                .attr("title", this.options.title || this.title || "")
                .addClass(this.additionalClass || "");
            this.renderSubviews();
            this.postRender($(this.el));
            return this;
        },

        renderSubviews: function() {
            var self = this;
            this.setupSubviews();
            _.each(this.subviews, function(property, selector){
                var view = _.isFunction(self[property]) ? self[property]() : self[property];
                if (view) {
                    var element = self.$(selector);
                    var id = element.attr("id"), klass = element.attr("class");
                    element.replaceWith(view.render().el);
                    $(view.el).attr("id", id);
                    $(view.el).addClass(klass);
                    view.delegateEvents();
                }
            });
        },

        template: function template(context) {
            return Handlebars.helpers.renderTemplate(this.className, context);
        }
    }));

    ns.Base = ns.Bare.extend({
        makeModel : $.noop,
        collectionModelContext: $.noop,
        additionalContext: function() {
            return {}
        },

        preInitialize : function() {
            this.makeModel.apply(this, arguments);
            this.resource = this.model || this.collection;

        },

        bindCallbacks : function() {
            if (this.resource) {
                if (!this.persistent) this.resource.bind("change", this.render);
                this.resource.bind("reset", this.render);
                this.resource.bind("add", this.render);
                this.resource.bind("validationFailed", this.showErrors, this);
                this.resource.bind("validated", this.clearErrors, this);
                this.resource.bind("saveFailed", this.showErrors, this);
            }
        },

        context: function context() { //phase me out for presenters, yo!
            var ctx = {};
            var self = this;

            if (this.resource) {
                ctx = _.clone(this.resource.attributes);
                ctx.loaded = this.resource.loaded;
                if (this.collection) {
                    ctx.models = _.map(this.collection.models, function(model) {
                        return _.extend(_.clone(model.attributes), self.collectionModelContext(model));
                    });
                }
                $.extend(ctx, {serverErrors : this.resource.serverErrors}, this.additionalContext(ctx));
            } else {
                ctx = this.additionalContext({})
            }
            return ctx;
        },

        showErrors : function() {
            var self = this;

            this.clearErrors();

            _.each(this.resource.errors, function(val, key) {
                var input = self.$("form input[name=" + key + "], form textarea[name=" + key + "]");
                input.addClass("has_error");
                input.qtip({
                    content: { text : val , prerender: 'true' },
                    style: "chorus",
                    position : {
                        corner : {
                            target: "rightMiddle",
                            tooltip: "leftMiddle"
                        },
                        adjust : {
                            screen : true
                        },
                        type : 'fixed',
                        container: self.el
                    },
                    hide: 'mouseout',
                    show: 'focus',
                    api: {
                        beforeRender: function() {
                            this.elements.target.bind('mouseover', this.show);
                            this.elements.target.bind('blur', this.hide);
                        }
                    }
                });

            });


            this.$(".errors").replaceWith(Handlebars.VM.invokePartial(Handlebars.partials.errorDiv, "errorDiv", this.context(), Handlebars.helpers, Handlebars.partials));
        },

        clearErrors : function() {
            var errors = this.$(".has_error");
            // qtip('destroy') clears the form, removeData clears the objects -- need to call both
            errors.qtip("destroy");
            errors.removeData("qtip");
            errors.removeClass("has_error");

            this.$(".errors").empty();
        }
    });

    ns.MainContentView = ns.Base.extend({
        className : "main_content",

        setup : function(options) {
            options = options || {}
            this.contentHeader = this.contentHeader || options.contentHeader;
            this.contentDetails = this.contentDetails || options.contentDetails;
            this.content = this.content || options.content;
            this.contentFooter = this.contentFooter || options.contentFooter;
        },

        subviews: {
            //todo get rid of the unnecessary div, css changes galore!
            ".content_header > div": "contentHeader",
            ".content_details > div": "contentDetails",
            ".content > div": "content",
            ".content_footer > div": "contentFooter"
        },

        postRender : function() {
            if (!this.contentDetails) this.$(".content_details").addClass("hidden");
            if (!this.content)        this.$(".content").addClass("hidden");
            if (!this.contentFooter)  this.$(".content_footer").addClass("hidden");
        }
    });

    ns.ListHeaderView = ns.Base.extend({
        className : "default_content_header",
        context : function() {
            return this.options
        },
        postRender : function() {
            var self = this;
            if (this.options.linkMenus) {
                _.each(_.keys(this.options.linkMenus), function(key) {
                    var menu = new chorus.views.LinkMenu(self.options.linkMenus[key]);
                    self.$(".menus").append(
                        menu.render().el
                    )
                    menu.bind("choice", function(eventType, choice) {
                        self.trigger("choice:" + eventType, choice);
                    })
                })
            }
        }
    })

    ns.MainContentList = ns.MainContentView.extend({
        setup : function(options) {
            var modelClass = options.modelClass
            var collection = this.collection;
            this.content = new chorus.views[modelClass + "List"]({collection: collection })
            this.contentHeader = new chorus.views.ListHeaderView({title: modelClass + "s", linkMenus : options.linkMenus})
            this.contentDetails = new chorus.views.ListContentDetails({collection : collection, modelClass : modelClass, addButton: options.addButton});
            this.contentFooter = new chorus.views.ListContentDetails({collection : collection, modelClass : modelClass, hideCounts : true, hideIfNoPagination : true})
        },
        additionalClass : "main_content_list"
    });
})(chorus.views);
