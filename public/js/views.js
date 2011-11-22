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

        context : function() {
            return {}
        },

        render: function render() {
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
                errorHTML = "<span class='error_detail' id="+key+">"+ val + "</span>";
                input.after(errorHTML);

            })

            this.$(".errors").replaceWith(Handlebars.VM.invokePartial(Handlebars.partials.errorDiv, "errorDiv", this.context(), Handlebars.helpers, Handlebars.partials));
        },

        clearErrors : function() {
            this.$(".has_error").removeClass("has_error");
            this.$(".error_detail").remove();
        }
    }),

    ns.MainContentView = ns.Base.extend({
        className : "main_content",

        postRender : function() {
            this.$("#content_header").html(this.contentHeader.render().el);
            this.contentHeader.delegateEvents();

            if (this.contentDetails) {
                this.$("#content_details").html(this.contentDetails.render().el);
                this.contentDetails.delegateEvents();
            } else {
                this.$("#content_details").addClass("hidden");
            }

            this.$("#content").html(this.content.render().el);
            this.content.delegateEvents();
        }
    })

    ns.MainContentList = ns.MainContentView.extend({
        setup : function(options) {
            var modelClass = options.modelClass
            var collection = this.collection;
            this.content = new chorus.views[modelClass + "List"]({collection: collection })
            this.contentHeader = new chorus.views.StaticTemplate("default_content_header", {title: modelClass + "s"})
            this.contentDetails = new chorus.views.Count({collection : collection, modelClass : modelClass})
        },
        additionalClass : "main_content_list"
    })

    ns.SubNavContentView = ns.Base.extend({
        className : "sub_nav_content",

        setup : function(options) {
            var modelClass = options.modelClass
            this.header = new chorus.views.SubNavHeader({ tab : options.tab, model : this.model });
            this.content = options.content;
        },

        postRender : function () {
            this.$("#sub_nav_header").html(this.header.render().el);
            this.header.delegateEvents();

            if (this.contentDetails) {
                this.$("#content_details").html(this.contentDetails.render().el);
                this.contentDetails.delegateEvents();
            } else {
                this.$("#content_details").addClass("hidden");
            }

            this.$("#content").html(this.content.render().el);
            this.content.delegateEvents();
        }
    })

    ns.SubNavContentList = ns.SubNavContentView.extend({
        setup : function(options) {
            var collection = this.collection;
            options.content = this.content = new chorus.views[options.modelClass + "List"]({collection: collection })
            this.__proto__.__proto__.setup.call(this, options);
            this.contentDetails = new chorus.views.Count({collection : collection, modelClass : options.modelClass})
        },
        additionalClass : "sub_nav_content_list"
    })

})(chorus.views);
