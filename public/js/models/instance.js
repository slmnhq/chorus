;
(function(ns) {
    ns.models.Instance = chorus.models.Base.extend({
        urlTemplate : "instance/{{id}}",
        showUrlTemplate : "instances/{{id}}",
        entityType: "instance",

        declareValidations : function(newAttrs) {
            if (newAttrs.provisionType == "register") {
                // validating existing Greenplum instance
                this.requirePattern("name", /^[a-zA-Z][a-zA-Z0-9_]*/, newAttrs);
                this.require("host", newAttrs);
                this.require("dbUserName", newAttrs);
                this.require("dbPassword", newAttrs);
                this.require("port", newAttrs);
                this.requirePattern("port", /\d+/, newAttrs);
            }
        },

        attrToLabel : {
            "dbUserName" : "instances.dialog.database_account",
            "dbPassword" : "instances.dialog.database_password",
            "name" : "instances.dialog.instance_name",
            "host" : "instances.dialog.host",
            "port" : "instances.dialog.port",
            "description" : "instances.dialog.description"
        }
    });
})(chorus);
