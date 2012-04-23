chorus.models.ImportTask = chorus.models.Task.extend({
    taskType: "runEdcImportWork",

    initialize: function() {
        this._super("initialize", arguments);
        this.set({sourceType:  "dataset"});
    }
})