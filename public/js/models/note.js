;
(function(ns) {
    ns.Note = chorus.models.Base.extend({
        urlTemplate : "comment/{{entityType}}/{{entityId}}",

        performValidation: function() {
            this.errors = {};
            this.require('body');
            return _(this.errors).isEmpty();
        },

        attrToLabel : {
            "body" : "notes.body"
        }
    });
})(chorus.models);