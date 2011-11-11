(function($, ns) {
    ns.UserIndexPage = chorus.pages.Base.extend({
        crumbs : [
            { label: t("breadcrumbs.home"), url: "/" },
            { label: t("breadcrumbs.users") }
        ],

        setup : function() {
            this.collection = new chorus.models.UserSet();
            this.collection.fetch();
            this.mainContent = new chorus.views.MainContentList({modelClass : "User", collection : this.collection})
            this.sidebar = new chorus.views.StaticTemplate("user_index_sidebar");
        }
    });
})
    (jQuery, chorus.pages);
