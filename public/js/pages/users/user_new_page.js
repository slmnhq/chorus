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

    chorus.views.UserNewMain = chorus.views.MainContentView.extend({
        setup : function(){
            this.content = new chorus.views.UserNew(),
            this.contentHeader = new chorus.views.StaticTemplate("default_content_header", {title: "New User"}),
            this.contentDetails = new chorus.views.StaticTemplate("plain_text", {text: "Details"})
        }
     })
})(jQuery, chorus.pages);
