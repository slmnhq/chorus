(function($, ns) {
    ns.UserNewPage = chorus.pages.Base.extend({
        crumbs : [
                    { label: t("breadcrumbs.home"), url: "/" },
                    { label: t("breadcrumbs.users"), url: "/users" },
                    { label : t("breadcrumbs.new_user") }
                ],

        setup : function(){
            this.mainContent = new chorus.views.UserNewMain()
        }
    });

    chorus.views.UserNewMain = chorus.views.MainContentView.extend({
        setup : function(){
            this.content = new chorus.views.UserNew();
            this.contentHeader = new chorus.views.StaticTemplate("default_content_header", {title: t("users.new_user")});
            var details = new chorus.views.StaticTemplate("plain_text", {text: t("users.details")});
            this.contentDetails = new chorus.views.Validating({model : this.content.model, childView : details});
        }
     })
})(jQuery, chorus.pages);
