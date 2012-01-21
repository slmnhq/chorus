;(function(ns) {
    var noStartingDigitRegex = /^[a-zA-Z]\w*$/;

    ns.models.Sandbox = ns.models.Base.extend({
        attrToLabel: {
            "instanceName" : "instances.dialog.instance_name",
            "databaseName": "instances.dialog.database_name",
            "schemaName": "instances.dialog.schema_name",
            "size": "instances.dialog.size"
        },

        urlTemplate: function(options) {
            var method = options && options.method;
            if (method === "update" || method === "delete") {
                return "workspace/{{workspaceId}}/sandbox/{{id}}";
            } else {
                return "workspace/{{workspaceId}}/sandbox";
            }
        },

        beforeSave: function(attrs) {
            var type = _.map(['instance', 'database', 'schema'], function(name) {
                return attrs[name] ? "0" : "1";
            });
            if (attrs.schemaName && attrs.schemaName === ns.models.Schema.DEFAULT_NAME) { type[2] = "0"; }
            attrs.type = type.join("");
        },

        declareValidations: function(attrs) {
            if (this.isCreatingNew("instance", attrs)) {
                this.require("instanceName", attrs);
                this.requirePattern("instanceName", noStartingDigitRegex, attrs);
                this.require("size", attrs);

                if (this.maximumSize) {
                    this.requireIntegerRange("size", 1, this.maximumSize, attrs);
                } else {
                    this.requirePositiveInteger("size", attrs);
                }
            }
            if (this.isCreatingNew('database', attrs)) {
                this.require("databaseName", attrs);
                this.requirePattern("databaseName", noStartingDigitRegex, attrs);
                this.require("schemaName", attrs);
                this.requirePattern("schemaName", noStartingDigitRegex, attrs);
            }
            if (this.isCreatingNew('schema', attrs)) {
                this.require("schemaName", attrs);
                this.requirePattern("schemaName", noStartingDigitRegex, attrs);
            }
        },

        isCreatingNew: function(type, attrs) {
            return !this.get(type) && !attrs[type];
        },

        schema: function() {
            this._schema = this._schema || new ns.models.Schema({
                id: this.get("schemaId"),
                name: this.get("schemaName"),
                databaseId: this.get("databaseId"),
                databaseName: this.get("databaseName"),
                instanceId: this.get("instanceId"),
                instanceName: this.get("instanceName")
            });

            return this._schema;
        },

        database: function() {
            this._database = this._database || new ns.models.Database({
                id: this.get("databaseId"),
                name: this.get("databaseName"),
                instanceId: this.get("instanceId"),
                instanceName: this.get("instanceName")
            });

            return this._database;
        }
    });
})(chorus);
