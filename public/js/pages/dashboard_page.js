;
(function($, ns) {
    ns.DashboardPage = chorus.pages.Base.extend({
        crumbs : [
            { label: t("breadcrumbs.home") }
        ],

        setup : function(){
            this.mainContent = new Backbone.View();
            this.sidebar = new chorus.views.StaticTemplate("dashboard_sidebar");
        }
    });
})(jQuery, chorus.pages);