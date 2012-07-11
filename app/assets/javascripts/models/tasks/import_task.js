chorus.models.ImportTask = chorus.models.Task.extend({
    initialize: function() {
        this._super("initialize", arguments);
        this.set({sourceType:  "dataset"});
    }
})
