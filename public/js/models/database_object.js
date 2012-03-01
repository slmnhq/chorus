chorus.models.DatabaseObject = chorus.models.TabularData.extend({
    constructorName: "DatabaseObject",

    initialize: function() {
        this._super('initialize', arguments);
    },

    urlTemplate: function() {
        return "data/" + this.get("instance").id + "/database/{{databaseName}}/schema/{{schemaName}}/" + this.metaType() + "/{{objectName}}"
    },

    showUrlTemplate: function() {
        return "instances/" + (this.get("instance") && this.get("instance").id) + "/database/{{databaseName}}/schema/{{schemaName}}/{{objectType}}/" + $("<div/>").html(this.get("objectName")).text()
    },

    toText: function() {
        return this.safePGName(this.get("schemaName")) + '.' + this.safePGName(this.get("objectName"));
    },

    isChorusView: function() {
        return false;
    }
});
