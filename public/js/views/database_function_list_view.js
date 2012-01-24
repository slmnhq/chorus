(function($, ns) {
    ns.views.DatabaseFunctionList = ns.views.Base.extend({
        className : "database_function_list",
        useLoadingSection: true,

        setup: function() {
            this.sandbox = this.options.sandbox;
            this.schema = this.sandbox.schema();
            this.resource = this.collection = this.functions = this.schema.functions();
            this.bindings.add(this.resource, "change reset add remove", this.render);
            this.functions.fetch();
        },

        collectionModelContext : function(model) {
          return {
              cid: model.cid
          }
        },

        additionalContext: function() {
            return {
                schemaName: this.sandbox.get('schemaName')
            };
        },

        postRender: function() {
            chorus.search({
                input: this.$('input.search'),
                list: this.$('ul')
            });
            this.$("li").qtip({
                content: "<a>"+t('database.sidebar.insert')+"</a>",
                events: {
                    render: _.bind(function(e, api) {
                        e.preventDefault();
                        e.stopPropagation();
                        $(api.elements.content).find('a').click(_.bind(this.insertFunction, this, $(api.elements.target).data('fun_cid')));
                    }, this),
                    show: function(e, api) {
                        $(api.elements.target).addClass('hover');
                    },
                    hide: function(e, api) {
                        $(api.elements.target).removeClass('hover');
                    }
                },
                show: {
                    delay: 0,
                    solo : true,
                    effect:false
                },
                hide: {
                    delay: 0,
                    fixed: true,
                    effect:false
                },
                position : {
                    my: "right center",
                    at: "left center",
                    adjust : {
                        x: -16
                    }
                },
                style: {
                    classes: "tooltip-insert",
                    tip: {
                        corner: "left center",
                        width: 16,
                        height: 29
                    }
                }
            });
        },

        insertFunction: function(cid, e) {
            e && e.preventDefault();
            var schemaFunction = this.functions.getByCid(cid)
            this.trigger("file:insertFunction", schemaFunction.toString())
        }

    });
})(jQuery, chorus);
