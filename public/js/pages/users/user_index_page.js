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


    chorus.views.UserIndexMain = chorus.views.MainContentView.extend({
        setup : function() {
            var userSet = new chorus.models.UserSet();
            userSet.fetch();
            this.content = new chorus.views.UserSet({collection: userSet })
            this.contentHeader = new chorus.views.StaticTemplate("default_content_header", {title: "Users"})
            console.log(this.content.context())
            this.contentDetails = new chorus.views.UserCount({collection : userSet})
        }
    })
})
    (jQuery, chorus.pages);
