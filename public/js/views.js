;
(function(ns) {
    ns.Bare = Backbone.View.extend({
        initialize: function initialize() {
            this.preInitialize();
            _.bindAll(this, 'render');
            this.bindCallbacks()
            this.setup.apply(this, arguments);
        },

        preInitialize : $.noop,
        setup: $.noop,
        postRender: $.noop,
        bindCallbacks: $.noop,
        preRender: $.noop,

        context : function() {
            return {}
        },

        render: function render() {
            this.preRender($(this.el));
            $(this.el).html(this.template(this.context()))
                .addClass(this.className)
                .attr("title", this.options.title || this.title || "")
                .addClass(this.additionalClass || "");
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
    });

    ns.Base = ns.Bare.extend({
        makeModel : $.noop,
        additionalContext: $.noop,
        collectionModelContext: $.noop,

        preInitialize : function() {
            this.makeModel();
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

        context: function context() {
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
                var input = self.$("form input[name=" + key + "], form textarea[name=" + name + "]");
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
        }
    });

    ns.MainContentView = ns.Base.extend({
        className : "main_content",

        setup : function(options) {
            options = options || {}
            this.contentHeader = this.contentHeader || options.contentHeader;
            this.contentDetails = this.contentDetails || options.contentDetails;
            this.content = this.content || options.content;
        },

        postRender : function() {
            this.$("#content_header").html(this.contentHeader.render().el);
            this.contentHeader.delegateEvents();

            if (this.contentDetails) {
                this.$("#content_details").html(this.contentDetails.render().el);
                this.contentDetails.delegateEvents();
            } else {
                this.$("#content_details").addClass("hidden");
            }

            if (this.content) {
                this.$("#content").html(this.content.render().el);
                this.content.delegateEvents();
            } else {
                this.$("#content").addClass("hidden");
            }
        }
    });

    ns.ListHeaderView = ns.Base.extend({
        className : "default_content_header",
        context : function(){
            return this.options
        },
        postRender : function(){
            var self=this;
            if (this.options.linkMenu) {
                var menu = new chorus.views.LinkMenu(this.options.linkMenu);
                this.$(".menus").append(
                    menu.render().el
                )
            }
        }
    })

    ns.MainContentList = ns.MainContentView.extend({
        setup : function(options) {
            var modelClass = options.modelClass
            var collection = this.collection;
            this.content = new chorus.views[modelClass + "List"]({collection: collection })
            this.contentHeader = new chorus.views.ListHeaderView({title: modelClass + "s", linkMenu : options.linkMenu})
            this.contentDetails = new chorus.views.Count({collection : collection, modelClass : modelClass})
        },
        additionalClass : "main_content_list"
    });
})(chorus.views);
