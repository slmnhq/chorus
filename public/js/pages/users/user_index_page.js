(function($, ns) {
    ns.UserIndexPage = chorus.pages.Base.extend({
        crumbs : [
            { label: "Home", url: "/" },
            { label: "Users" }
        ],

        setup : function() {

            this.mainContent = new chorus.views.UserIndexMain()
            this.sidebar = new chorus.views.StaticTemplate("user_set_sidebar");
        }
    });


    chorus.views.UserIndexMain = chorus.views.ListView.extend({
        modelClass : "User"
    })
})
    (jQuery, chorus.pages);
