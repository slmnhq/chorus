;(function(ns) {
    var noStartingDigitRegex = /^[a-zA-Z]\w*$/;

    ns.models.Sandbox = ns.models.Base.extend({
        urlTemplate: function(options) {
            var method = options && options.method;
            if (method === "update" || method === "delete") {
                return "workspace/{{workspaceId}}/sandbox/{{id}}";
            } else {
                return "workspace/{{workspaceId}}/sandbox";
            }
        },

        beforeSave: function(attrs) {
            attrs.type = _.map(['instance', 'database', 'schema'], function(name) {
                return attrs[name] ? "0" : "1";
            }).join("");
        },

        declareValidations: function(attrs) {
            this.require("instance", attrs);
            if (this.isCreatingNew('database', attrs)) {
                this.requirePattern("databaseName", noStartingDigitRegex, attrs);
                this.requirePattern("schemaName", noStartingDigitRegex, attrs);
            }
            if (this.isCreatingNew('schema', attrs)) {
                this.requirePattern("schemaName", noStartingDigitRegex, attrs);
            }
        },

        isCreatingNew: function(type, attrs) {
            return !this.get(type) && !attrs[type];
        }
    });
})(chorus);
