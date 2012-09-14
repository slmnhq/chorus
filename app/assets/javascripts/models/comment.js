chorus.models.Comment = chorus.models.Activity.extend({
    constructorName: "Comment",
    urlTemplate:function (options) {
        return "comments/{{id}}";
    },

    initialize:function () {
        this._super('initialize', arguments);
        this.files = [];
    },

    declareValidations:function (newAttrs) {
        this.require('text', newAttrs);
    },

    attrToLabel:{
        "text":"notes.body"
    },

    note: function() {
        return this.get('type') && this.get("type") == "NOTE";
    }
});
