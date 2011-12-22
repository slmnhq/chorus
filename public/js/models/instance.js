;
(function(ns) {
    ns.models.Instance = chorus.models.Base.extend({
        urlTemplate : "instance/{{id}}",
        showUrlTemplate : "instances/{{id}}",
        entityType: "instance",

        declareValidations : function(newAttrs) {
            if (newAttrs.provisionType == "register") {
                // validating existing Greenplum instance
                this.require("name", newAttrs);
                this.require("host", newAttrs);
                this.require("dbUserName", newAttrs);
                this.require("dbPassword", newAttrs);
                this.requirePattern("port", /\d+/, newAttrs);
            }
        }
    });
})(chorus);