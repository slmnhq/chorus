;(function(ns) {
    ns.models.Comment = ns.models.Activity.extend({
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
        },

        note: function() {
            return !!this.get('type');
        }
    });
})(chorus);
