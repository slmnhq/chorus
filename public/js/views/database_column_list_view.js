(function($, ns) {
    ns.views.DatabaseColumnList = ns.views.DatabaseList.extend({
        className : "database_column_list",
        useLoadingSection: true,

        events: {
            "click a" : "onNameClicked",
            "click a.back" : "onBackClicked"
        },

        makeModel: function() {
            this.collection = new ns.collections.DatabaseColumnSet();
            this.schema = this.options.sandbox.schema();
        },

        setup: function() {
            this.bind("datasetSelected", this.setTableOrView, this);
        },

        setTableOrView: function(tableOrView) {
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
        },

        additionalContext: function() {
            var tableOrViewName = this.collection.attributes.tableName || this.collection.attributes.viewName;
            var schemaName = this.collection.attributes.schemaName;

            return {
                schemaSpan: ns.helpers.spanFor(schemaName, { class: "schema", title: schemaName }),
                tableOrViewSpan: ns.helpers.spanFor(tableOrViewName, { class: "table", title: tableOrViewName })
            };
        }
    });
})(jQuery, chorus);
