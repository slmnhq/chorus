chorus.models.Sandbox = chorus.models.Base.extend({
    constructorName: "Sandbox",
    attrToLabel: {
        "instanceName": "instances.dialog.instance_name",
        "databaseName": "instances.dialog.database_name",
        "schemaName": "instances.dialog.schema_name",
        "size": "instances.dialog.size",
        "dbUsername": "instances.dialog.database_name",
        "dbPassword": "instances.dialog.database_password"
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

        attrs.type = type.join("");
    },

    declareValidations: function(attrs) {
        if (this.isCreatingNew("instance", attrs)) {
            this.require("instanceName", attrs);
            this.requirePattern("instanceName", chorus.ValidationRegexes.ChorusIdentifier(44), attrs);
            this.require("size", attrs);

            if (this.maximumSize) {
                this.requireIntegerRange("size", 1, this.maximumSize, attrs);
            } else {
                this.requirePositiveInteger("size", attrs);
            }
        }
        if (this.isCreatingNew('database', attrs)) {
            this.require("databaseName", attrs);
            this.requirePattern("databaseName", chorus.ValidationRegexes.ChorusIdentifierLower(63), attrs);
            this.require("schemaName", attrs);
            this.requirePattern("schemaName", chorus.ValidationRegexes.ChorusIdentifierLower(63), attrs);
        }
        if (this.isCreatingNew('schema', attrs)) {
            this.require("schemaName", attrs);
            this.requirePattern("schemaName", chorus.ValidationRegexes.ChorusIdentifierLower(63), attrs);
        }
        if ((this.get("type") === "111") || (attrs.type === "111")) {
            this.require("dbUsername", attrs);
            this.requirePattern("dbPassword", chorus.ValidationRegexes.Password({min: 6, max: 256}), attrs);
        }
    },

    isCreatingNew: function(type, attrs) {
        return !this.get(type) && !attrs[type];
    },

    instance: function() {
        this._instance = this._instance || this.database().instance();
        return this._instance;
    },

    database: function() {
        this._database = this._database || this.schema().database();

        return this._database;
    },

    schema: function() {
        this._schema = this._schema || new chorus.models.Schema({
            id: this.get("schemaId"),
            name: this.get("schemaName"),
            database: {
                id: this.get("databaseId"),
                name: this.get("databaseName"),
                instance: {
                    id: this.get("instanceId"),
                    name: this.get("instanceName")
                }
            }
        });

        return this._schema;
    },

    canonicalName: function() {
        return this.schema().canonicalName();
    }
});
