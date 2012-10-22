chorus.pages.UserNewPage = chorus.pages.Base.extend({
    crumbs:[
        { label:t("breadcrumbs.home"), url:"#/" },
        { label:t("breadcrumbs.users"), url:"#/users" },
        { label:t("breadcrumbs.new_user") }
    ],
    helpId: "user_new",

    setup:function () {
        this.model = new chorus.models.User();

        this.mainContent = new chorus.views.MainContentView({
            model:this.model,
            contentHeader:new chorus.views.StaticTemplate("default_content_header", {title:t("users.new_user")}),
            contentDetails:new chorus.views.StaticTemplate("plain_text", {text:t("users.details")})
        });

        var config = chorus.models.Config.instance();
        this.dependOn(config);
        config.fetch(); // needs to refetch to see ldap #28824949
        this.bindings.add(config, "loaded", this.configLoaded);
    },

    configLoaded: function() {
        this.mainContent.content = (chorus.models.Config.instance().isExternalAuth())
            ? new chorus.views.UserNewLdap({model: this.model}) : new chorus.views.UserNew({model: this.model});
        this.render();
    }
});
