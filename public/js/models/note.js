;
(function(ns) {
    ns.Note = chorus.models.Base.extend({
        urlTemplate : "comment/{{entityType}}/{{entityId}}",

        declareValidations: function() {
            this.require('body');
        },

        attrToLabel : {
            "body" : "notes.body"
        }
    });
})(chorus.models);