;(function(ns) {
    ns.models.DatabaseSet = ns.models.Collection.extend({
        model : ns.models.Database,
        urlTemplate : "instance/{{instanceId}}/database",
        setup : function() {
            this.bind("reset", this.applyInstanceIdToDatabases, this);
        },

        applyInstanceIdToDatabases : function() {
            var id = this.attributes.instanceId;
            this.each(function(db) {
                db.instanceId = id;
            });
        },

        parse: function(data) {
            if (data.resource.length && data.resource[0].databaseList) {
                data.resource = data.resource[0].databaseList;
            }

            return this._super('parse', [data]);
        }
    });
})(chorus);
