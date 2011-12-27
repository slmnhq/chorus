;
(function(ns) {
    ns.Note = chorus.models.Base.extend({
        urlTemplate : "comment/{{entityType}}/{{entityId}}",

        declareValidations: function(newAttrs) {
            this.require('body', newAttrs);
        },

        attrToLabel : {
            "body" : "notes.body"
        },

        beforeSave: function() {
            if (this.workfiles) {
                var workfileIds = this.workfiles.map(function(workfile) {
                    return workfile.get("id");
                }).join(",");
                this.set({ workfileIds: workfileIds }, { silent: true });
            }
        }
    });
})(chorus.models);
