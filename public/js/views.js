;
(function(ns) {
    ns.Bare = Backbone.View.extend({
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
    });

    ns.Base = ns.Bare.extend({
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

    ns.MainContentView = ns.Base.extend({
        className : "main_content",

        postRender : function() {
            this.contentHeader.el = this.$("#content_header");
            this.contentHeader.delegateEvents();
            this.contentHeader.render();

            if (this.contentDetails) {
                this.contentDetails.el = this.$("#content_details");
                this.contentDetails.delegateEvents();
                this.contentDetails.render();
            } else {
                this.$("#content_details").addClass("hidden");
            }

            this.content.el = this.$("#content");
            this.content.delegateEvents();
            this.content.render();
        }
    })

    ns.ListView = ns.MainContentView.extend({
        setup : function() {
            var collection = new chorus.models[this.modelClass + "Set"]();
            collection.fetch();
            this.content = new chorus.views[this.modelClass + "Set"]({collection: collection })
            this.contentHeader = new chorus.views.StaticTemplate("default_content_header", {title: this.modelClass})
            this.contentDetails = new chorus.views.Count({collection : collection, modelClass : this.modelClass})
        }
    })
})(chorus.views);