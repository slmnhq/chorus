chorus.views.DatabaseFunctionSidebarList = chorus.views.DatabaseSidebarList.extend({
    className:"database_function_sidebar_list",
    useLoadingSection:true,

    collectionModelContext:function (schemaFunction) {
        return {
            hintText:schemaFunction.toHintText(),
            cid:schemaFunction.cid
        }
    },

    fetchResourceAfterSchemaSelected: function() {
        this.resource = this.collection = this.schema.functions();
        this.bindings.add(this.resource, "change reset add remove", this.render);
        this.collection.fetch();
    }
});

