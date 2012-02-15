chorus.pages.UserNewPage = chorus.pages.Base.extend({
    crumbs:[
        { label:t("breadcrumbs.home"), url:"#/" },
        { label:t("breadcrumbs.users"), url:"#/users" },
        { label:t("breadcrumbs.new_user") }
    ],
    helpId: "user_new",

    setup:function () {
        this.model = new chorus.models.User()
        this.requiredResources.push(chorus.models.Config.instance());
    },

    resourcesLoaded: function() {
        var config = chorus.models.Config.instance();
        var viewClass = (config.isExternalAuth()) ? chorus.views.UserNewLdap : chorus.views.UserNew;

        this.mainContent = new chorus.views.MainContentView({
            model:this.model,
            content: new viewClass({ model: this.model }),
            contentHeader:new chorus.views.StaticTemplate("default_content_header", {title:t("users.new_user")}),
            contentDetails:new chorus.views.StaticTemplate("plain_text", {text:t("users.details")})
        });

        this.render();
    }
});
