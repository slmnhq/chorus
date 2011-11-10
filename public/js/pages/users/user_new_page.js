(function($, ns) {
    ns.UserNewPage = chorus.pages.Base.extend({
        crumbs : [
                    { label: "Home", url: "/" },
                    { label: "Users", url: "/users" },
                    { label : "New User" }
                ],

        setup : function(){
            this.mainContent = new chorus.views.UserNewMain()
        }
    });
})(jQuery, chorus.pages);
