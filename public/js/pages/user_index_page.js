(function($, ns) {
    ns.UserIndexPage = chorus.pages.Base.extend({
        crumbs : [
                    { label: "Home", url: "/" },
                    { label: "Users" }
                ],

        setup : function() {
            var userSet = new chorus.models.UserSet();
            userSet.fetch();
            this.mainContent = new chorus.views.UserSet({collection: userSet });
            this.sidebar = new chorus.views.StaticTemplate("user_set_sidebar");
        }
    });
})(jQuery, chorus.pages);
