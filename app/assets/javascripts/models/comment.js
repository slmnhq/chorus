chorus.models.Comment = chorus.models.Activity.extend({
    constructorName: "Comment",
    urlTemplate:function (options) {
        if (options && options.isFile) {
            return "comment/{{entityType}}/{{encode entityId}}/{{id}}/file"
        } else if (this.isNew()) {
            return "comment/{{entityType}}/{{encode entityId}}"
        } else {
            return "comment/{{entityType}}/{{encode entityId}}/{{id}}";
        }
    },

    initialize:function () {
        this._super('initialize', arguments);
        this.files = [];
    },

    declareValidations:function (newAttrs) {
        this.require('body', newAttrs);
    },

    attrToLabel:{
        "body":"notes.body"
    },

    beforeSave:function () {
        if (this.workfiles) {
            this.set({ workfileIds:this.workfiles.pluck('id').join(',') }, { silent:true });
        }
        if (this.datasets) {
            this.set({ datasetIds:this.datasets.pluck('id').join(',') }, { silent:true });
        }
    },

    note: function() {
        return this.get('type') && this.get("type") == "NOTE";
    }
});
