; (function($, ns) {
    ns.SubNav = chorus.views.Base.extend({
        className : "sub_nav",
        tagName : "ul",

        setup: function(options) {
            this.resource = this.resource || options.workspace;
        },

        postRender : function() {
            this.$("li").removeClass("selected");

            var selected = this.$("li." + this.options.tab);
            selected.addClass("selected");
        }
    });
})(jQuery, chorus.views);
