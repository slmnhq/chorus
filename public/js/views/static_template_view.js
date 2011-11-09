(function($, ns) {
    ns.StaticTemplate = function(className) {
        this.className = className;
        var klass = chorus.views.Base.extend({
            className : className
        });

        return new klass();
    }
})(jQuery, chorus.views);