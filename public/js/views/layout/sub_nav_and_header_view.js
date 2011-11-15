; (function($, ns) {
    ns.SubNavHeader = chorus.views.Base.extend({
        className : "sub_nav_and_header",

        postRender : function() {
            this.$("li").removeClass("selected");

            var selected = this.$("li." + this.options.tab);
            selected.addClass("selected");
            this.$(".subnav_header h1").text(selected.text());
        }
    });
})(jQuery, chorus.views);