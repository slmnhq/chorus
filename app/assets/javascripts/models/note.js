chorus.models.Note = chorus.models.Activity.extend({
   constructorName: "Note",
   urlTemplate: "notes/{{id}}",

    declareValidations:function (newAttrs) {
        this.require('body', newAttrs);
    },

    attrToLabel:{
        "body":"notes.body"
    }
});