;
(function(ns) {
    ns.Note = chorus.models.Base.extend({
        urlTemplate : "comment/{{entityType}}/{{entityId}}",

        declareValidations: function(newAttrs) {
            this.require('body', newAttrs);
        },

        attrToLabel : {
            "body" : "notes.body"
        }
    });
})(chorus.models);