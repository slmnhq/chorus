(function($, ns) {
    ns.UserNewPage = chorus.pages.Base.extend({
        crumbs : [
            { label: t("breadcrumbs.home"), url: "/" },
            { label: t("breadcrumbs.users"), url: "/users" },
            { label : t("breadcrumbs.new_user") }
        ],

        setup : function(){
            this.model = new chorus.models.User()

            this.mainContent = new chorus.views.MainContentView({
                model : this.model,
                content : new chorus.views.UserNew({model : this.model}),
                contentHeader : new chorus.views.StaticTemplate("default_content_header", {title: t("users.new_user")}),
                contentDetails : new chorus.views.StaticTemplate("plain_text", {text: t("users.details")}),
            })
        }
    });
})(jQuery, chorus.pages);
