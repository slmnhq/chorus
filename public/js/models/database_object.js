chorus.models.DatabaseObject = chorus.models.TabularData.extend({

    initialize: function() {
        this._super('initialize', arguments);
        //TODO: Remove me after https://www.pivotaltracker.com/story/show/25670355 is done.
        this.bind("change", function() {
            this.entityId = [
                this.attributes.instance.id,
                this.attributes.databaseName,
                this.attributes.schemaName,
                this.attributes.objectType,
                this.attributes.objectName
            ].join('|');
        })
    },

    urlTemplate: function() {
        return "data/" + this.get("instance").id + "/database/{{databaseName}}/schema/{{schemaName}}/" + this.metaType() + "/{{objectName}}"
    },

    showUrlTemplate: function() {
        return "instances/" + this.get("instance").id + "/database/{{databaseName}}/schema/{{schemaName}}/{{objectType}}/{{objectName}}"
    },

    toText: function() {
        return this.safePGName(this.get("schemaName")) + '.' + this.safePGName(this.get("objectName"));
    },

    isChorusView: function() {
        return false;
    }
});
