(function () {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs:function () {
            return [
                { label:t("breadcrumbs.home"), url:"#/" },
                { label:t("breadcrumbs.users"), url:"#/users" },
                { label:this.model.displayShortName(20) }
            ];
        }
    })
    chorus.pages.UserShowPage = chorus.pages.Base.extend({
        helpId: "user",

        setup:function (userId) {
            this.model = new chorus.models.User({id:userId});
            this.model.invalidRouteOnFetchFailed();
            this.model.fetch();
            this.breadcrumbs = new breadcrumbsView({model:this.model});

            this.mainContent = new chorus.views.MainContentView({
                model:this.model,
                content:new chorus.views.UserShow({model:this.model}),
                contentHeader:new chorus.views.DisplayNameHeader({ model:this.model }),
                contentDetails:new chorus.views.StaticTemplate("plain_text", {text:t("users.details")})
            });

            this.sidebar = new chorus.views.UserShowSidebar({model:this.model})
        }
    });
})();