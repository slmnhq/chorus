chorus.models.InsightCount = chorus.models.Base.extend({
    constructorName: 'InsightCount',
    parameterWrapper : 'insight',
    urlTemplate: function() {
        return this.get('noteId') ? "insights/promote" : "insights";
    }
}, {
    count: function(options) {
        options || (options = {});
        var count = new chorus.models.Base();
        count.urlTemplate = "insights/count";
        count.urlParams = options.urlParams;
        return count;
    }
});
