chorus.models.DatabaseObject = chorus.models.TabularData.extend({
    constructorName: "DatabaseObject",

    initialize: function() {
        this._super('initialize', arguments);
    },

    urlTemplate: function() {
        return "data/" + this.get("instance").id + "/database/{{databaseName}}/schema/{{schemaName}}/" + this.metaType() + "/{{objectName}}"
    },

    showUrlTemplate: function() {
        return "instances/" + (this.get("instance") && this.get("instance").id) + "/databases/{{databaseName}}/schemas/{{schemaName}}/{{objectType}}/" + $("<div/>").html(this.get("objectName")).text()
    },

    urlTemplateAttributes: function() {
        return {
            databaseName: $.stripHtml(this.get("databaseName")),
            schemaName: $.stripHtml(this.get("schemaName")),
            objectName: $.stripHtml(this.get("objectName")),
            objectType: this.get("objectType")
        }
    },

    toText: function() {
        return this.safePGName(this.get("schemaName")) + '.' + this.safePGName(this.get("objectName"));
    },

    isChorusView: function() {
        return false;
    }
});
