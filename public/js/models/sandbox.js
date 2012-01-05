;(function(ns) {
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
        }
    });
})(chorus);
