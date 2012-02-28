chorus.models.DatabaseObject = chorus.models.TabularData.extend({
    urlTemplate: function() {
        return "data/" + this.baseUrlTemplate();
    },

    showUrlTemplate: function () {
        return "instances/" + this.baseUrlTemplate();
    },

    toText:function () {
        return this.safePGName(this.get("schemaName")) + '.' + this.safePGName(this.get("objectName"));
    },

    isChorusView: function () {
        return false;
    },

    baseUrlTemplate: function () {
        return this.get("instance").id + "/database/{{databaseName}}/schema/{{schemaName}}/" + this.metaType() + "/{{objectName}}"
    }
});
