(function($, ns) {
    ns.views.SchemaColumnList = ns.views.Base.extend({
        className : "schema_column_list",
        useLoadingSection: true,

        events: {
            "click a" : "onNameClicked",
            "click a.back" : "onBackClicked"
        },

        makeModel: function() {
            this.collection = new ns.models.DatabaseColumnSet();
            this.schema = this.options.sandbox.schema();
        },

        setup: function() {
            this.bind("datasetSelected", this.setTable, this);
        },

        setTable: function(tableOrView) {
            this.resource = this.collection = tableOrView.columns();
            this.collection.fetch();
            this.collection.bind("reset", this.render, this);
        },

        onNameClicked: function(e) {
            e.preventDefault();
        },

        onBackClicked: function(e) {
            e.preventDefault();
            this.trigger("back");
        }
    });
})(jQuery, chorus);
