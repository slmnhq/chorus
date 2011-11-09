;
(function($, ns) {
    ns.DashboardPage = chorus.pages.Base.extend({
        crumbs : [
            { label: "Home" }
        ],

        setup : function(){
            this.mainContent = new Backbone.View();
        }
    });
})(jQuery, chorus.pages);