chorus.views.SchemaListSidebar = chorus.views.Sidebar.extend({
    templateName: "schema_list_sidebar",

    setup: function() {
        chorus.PageEvents.subscribe("schema:selected", this.setSchema, this);
        chorus.PageEvents.subscribe("schema:deselected", this.unsetSchema, this);

    },

    setSchema: function(schema) {
        this.resource = schema;
        this.render();
    },

    unsetSchema: function() {
        delete this.resource;
        this.render();
    }
});