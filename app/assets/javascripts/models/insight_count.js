chorus.models.InsightCount = chorus.models.Base.extend({
    constructorName: 'InsightCount',
    parameterWrapper : 'insight',
    urlTemplate: function() {
        var action = this.get('action');
        var noteId = this.get('noteId');

        if (!noteId) {
            return "insights";
        }
        
        return "insights/" + action;
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
