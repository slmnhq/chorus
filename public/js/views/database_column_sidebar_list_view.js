chorus.views.DatabaseColumnSidebarList = chorus.views.DatabaseSidebarList.extend({
    className:"database_column_sidebar_list",
    useLoadingSection:true,

    events:{
        "click a":"onNameClicked",
        "click a.back":"onBackClicked"
    },

    makeModel:function () {
        this.collection = new chorus.collections.DatabaseColumnSet();
        this.schema = this.options.sandbox.schema();
    },

    setup:function () {
        this.bind("datasetSelected", this.setTableOrView, this);
    },

    setTableOrView:function (tableOrView) {
        this.resource = this.collection = tableOrView.columns();
        this.collection.fetchAll();
        this.collection.bind("reset", this.render, this);
    },

    onNameClicked:function (e) {
        e.preventDefault();
    },

    onBackClicked:function (e) {
        e.preventDefault();
        this.trigger("back");
    },

    additionalContext:function () {
        var tableOrViewName = this.collection.attributes.tableName || this.collection.attributes.viewName;
        var schemaName = this.collection.attributes.schemaName;

        return {
            schemaSpan:chorus.helpers.spanFor(schemaName, { 'class':"schema", title:schemaName }),
            tableOrViewSpan:chorus.helpers.spanFor(tableOrViewName, { 'class':"table", title:tableOrViewName })
        };
    }
});

