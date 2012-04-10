chorus.views.DatabaseColumnSidebarList = chorus.views.DatabaseSidebarList.extend({
    constructorName: "DatabaseColumnSidebarListView",
    className:"database_column_sidebar_list",
    useLoadingSection:true,

    events:{
        "click a":"onNameClicked",
        "click a.back":"onBackClicked"
    },

    makeModel:function () {
        this.collection = new chorus.collections.DatabaseColumnSet();
        this.schema = this.options.schema;
    },

    setup:function () {
        this.bind("datasetSelected", this.setTableOrView, this);
    },

    setTableOrView:function (tableOrView) {
        this.resource = this.collection = tableOrView.columns();
        this.collection.fetchAll();
        this.bindings.add(this.collection, "reset", this.render);
    },

    onNameClicked:function (e) {
        e.preventDefault();
    },

    onBackClicked:function (e) {
        e.preventDefault();
        this.trigger("back");
    },

    additionalContext:function () {
        var tableOrViewName = this.collection.attributes.tableName || this.collection.attributes.viewName || this.collection.attributes.queryName;
        var schemaName = this.collection.attributes.schemaName;

        return {
            schemaSpan:chorus.helpers.spanFor(schemaName, { 'class':"schema", title:schemaName }),
            tableOrViewSpan:chorus.helpers.spanFor(tableOrViewName, { 'class':"table", title:tableOrViewName })
        };
    },

    collectionModelContext: function(model) {
        return {
            cid: model.cid,
            fullName: model.toText()
        }
    }
});
