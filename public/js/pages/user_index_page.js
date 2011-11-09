(function($, ns) {
    ns.UserIndexPage = chorus.pages.Base.extend({
        crumbs : [
                    { label: "Home", url: "/" },
                    { label: "Users" }
                ],

        mainContent : function() {
            var userSet = new chorus.models.UserSet();
            userSet.fetch();
            return new chorus.views.UserSet({collection: userSet })
        }
    });
})(jQuery, chorus.pages);
