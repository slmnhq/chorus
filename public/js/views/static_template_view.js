(function($, ns) {
    ns.StaticTemplate = function(className, context) {
        var klass = chorus.views.Base.extend({
            className : className,
            context : context,

            postRender : function() {
                this.$(this.el).addClass(className)
            }
        });

        return new klass();
    }
})(jQuery, chorus.views);
