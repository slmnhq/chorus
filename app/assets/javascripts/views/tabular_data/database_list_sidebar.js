chorus.views.DatabaseListSidebar = chorus.views.Sidebar.extend({
    templateName: "database_list_sidebar",

    setup: function() {
        chorus.PageEvents.subscribe("database:selected", this.setDatabase, this);
        chorus.PageEvents.subscribe("database:deselected", this.unsetDatabase, this);
    },

    setDatabase: function(database) {
        this.resource = database;
        this.render();
    },

    unsetDatabase: function() {
        delete this.resource;
        this.render();
    }
});