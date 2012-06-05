chorus.views.DatabaseColumnSidebarList = chorus.views.DatabaseSidebarList.extend({
    constructorName: "DatabaseColumnSidebarListView",
    templateName:"database_column_sidebar_list",
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
        chorus.PageEvents.subscribe("datasetSelected", this.setTableOrView, this);
    },

    postRender: function() {
        this._super("postRender", arguments);

        chorus.search({
            list: this.$('ul'),
            input: this.$('input.search')
        });
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
        console.log(this.collection)
        var tableOrViewName = this.collection.attributes.tableName || this.collection.attributes.viewName || this.collection.attributes.queryName;
        var schemaName = this.collection.attributes.tabularData.schema.name;

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
