chorus.collections.DatasetSet = chorus.collections.LastFetchWins.extend({
    model:chorus.models.Dataset,
    urlTemplate:function() {
        if (this.attributes.workspaceId) {
            return "workspace/{{workspaceId}}/dataset" + this.addParams();
        } else {
            return "data/{{instanceId}}/database/{{encode databaseName}}/schema/{{encode schemaName}}" + this.addParams();
        }
    },

    addParams: function() {
        // TODO: PLZ REFACTOR ME!

        var params = ["type", "objectType"];
        var mapped = _.map(params, function(param) { return { key: param, value: this.attributes[param] }; }, this)

        var compacted = _.compact(_.map(mapped, function(param) {
            if (param.value) {
                return { key: param.key, value: param.value };
            } else {
                return false;
            }
        }, this));

        var param_count = compacted.length;
        if(!param_count) return "";

        var string = "?";
        var strings = _.map(compacted, function(param) {
            return param.key + "=" + param.value;
        }, this)
        var result = "?" + strings.join("&");
        return result;
    },

    urlParams: function() {
        var ctx = {namePattern: this.attributes.namePattern};
        if (!this.attributes.workspaceId) {
            ctx.type = "meta";
        }
        return ctx;
    },

    comparator: function(dataset) {
        return dataset.get("objectName").toLowerCase();
    }
});