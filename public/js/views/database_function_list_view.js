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
            this.$('.list li').hover(_.bind(this.showInsert, this), _.bind(this.hideInsert, this))
            this.$('.list .insert_link').bind('click', _.bind(this.insertFunction, this));

        },

        insertFunction: function(e) {
            e && e.preventDefault();
            var schemaFunction = this.functions.getByCid($(e.currentTarget).data('fun_cid'))
            this.trigger("file:insertFunction", schemaFunction.toString())
        },

        showInsert: function(e) {
            $(e.currentTarget).find('.insert_hover').removeClass('hidden')
        },

        hideInsert: function() {
            this.$('.insert_hover').addClass('hidden');
        }

    });
})(jQuery, chorus);
