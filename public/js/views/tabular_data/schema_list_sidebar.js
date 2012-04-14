chorus.views.SchemaListSidebar = chorus.views.Sidebar.extend({
    templateName: "schema_list_sidebar",

    setup: function() {
        chorus.PageEvents.subscribe("schema:selected", this.setSchema, this);
    },

    setSchema: function(schema) {
        this.resource = schema;
        this.render();
    }
});