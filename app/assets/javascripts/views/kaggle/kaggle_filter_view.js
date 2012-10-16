chorus.views.KaggleFilter = chorus.views.Filter.extend({
    templateName: "kaggle_filter",
    tagName: 'li',

    setup: function() {
        this.collection = new chorus.collections.KaggleColumnSet();
        this._super("setup", arguments);
    }
})