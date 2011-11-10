(function($, ns) {
    ns.Count = chorus.views.Base.extend({
        className : "count",
        additionalContext: function(){
            console.log(this)
            return {modelClass : this.options.modelClass}
        }
    });
})(jQuery, chorus.views);