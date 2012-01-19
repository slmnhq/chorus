;(function(ns) {
    ns.models.Schema = ns.models.Base.extend({
        urlTemplate: "/data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}",

        tables: function() {
            if(!this._tables) {
                this._tables = new chorus.models.TableSet([], {schema: this});
            }
            return this._tables;
        }
    }, {
        DEFAULT_NAME: "public"
    });
})(chorus);
