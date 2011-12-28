;(function(ns) {
    ns.models.Comment = ns.models.Base.extend({
        urlTemplate : "comment/{{entityType}}/{{entityId}}",

        creator: function() {
            return this._creator || (this._creator = new ns.models.User(this.get("author")));
        },

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
})(chorus);
