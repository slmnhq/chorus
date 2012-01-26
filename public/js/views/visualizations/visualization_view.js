;(function(ns) {
    ns.views.Visualization = ns.views.Base.extend({
        render: function() {
            var $el = $(this.el);
            $el.addClass("visualization");
            return this;
        }
    });
})(chorus);
