chorus.views.DatabaseFunctionSidebarList = chorus.views.DatabaseSidebarList.extend({
    constructorName: "DatabaseFunctionSidebarListView",
    className:"database_function_sidebar_list",
    useLoadingSection:true,

    postRender: function() {
        this._super("postRender", arguments);

        chorus.search({
            list: this.$('ul'),
            input: this.$('input.search')
        });
    },

    collectionModelContext: function(model) {
        return {
            hintText: model.toHintText(),
            cid: model.cid,
            name: model.get("functionName"),
            fullName: model.toText()
        }
    },

    fetchResourceAfterSchemaSelected: function() {
        this.resource = this.collection = this.schema.functions();
        this.bindings.add(this.resource, "change reset add remove", this.render);
        this.collection.fetchIfNotLoaded();
    },

    displayLoadingSection: function () {
        return this.schema && !(this.collection && (this.collection.loaded || this.collection.serverErrors));
    }
});
