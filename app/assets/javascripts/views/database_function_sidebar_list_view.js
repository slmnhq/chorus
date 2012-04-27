chorus.views.DatabaseFunctionSidebarList = chorus.views.DatabaseSidebarList.extend({
    constructorName: "DatabaseFunctionSidebarListView",
    templateName:"database_function_sidebar_list",
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

    additionalContext: function() {
        return _.extend(this._super("additionalContext", arguments), {
            hasCollection: !!this.collection
        });
    },

    fetchResourceAfterSchemaSelected: function() {
        this.resource = this.collection = this.schema.functions();
        this.bindings.add(this.resource, "change reset add remove fetchFailed", this.render);
        this.collection.fetchIfNotLoaded();
    },

    displayLoadingSection: function () {
        return this.schema && !(this.collection && (this.collection.loaded || this.collection.serverErrors));
    }
});
