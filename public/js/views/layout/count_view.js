(function($, ns) {
    ns.Count = chorus.views.Base.extend({
        className : "count",
        additionalContext: function(){
            return {modelClass : this.options.modelClass}
        }
    });
})(jQuery, chorus.views);