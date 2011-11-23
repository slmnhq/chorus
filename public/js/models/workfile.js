;(function(ns) {
    ns.Workfile = chorus.models.Base.extend({
        urlTemplate : "workspace/{{workspaceId}}/workfile/{{id}}",

        modifier : function() {
            return new ns.User({
                userName : this.get("modifiedBy"),
                firstName : this.get("modifierFirstName"),
                lastName : this.get("modifierLastName")
            })
        },

        performValidation : function(){
            this.errors = {}
            this.require("fileName")
            return _(this.errors).isEmpty();
        },

        attrToLabel : {
            "fileName" : "workfiles.validation.name"
        }
    });
})(chorus.models);
