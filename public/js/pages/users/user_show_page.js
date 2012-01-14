(function($, ns) {
    ns.UserShowPage = chorus.pages.Base.extend({
        setup : function(userId){
            this.model = new chorus.models.User({id: userId});
            this.model.fetch();
            this.breadcrumbs = new chorus.views.UserShowBreadcrumbView({model: this.model});

            this.mainContent = new chorus.views.MainContentView({
                model : this.model,
                content : new chorus.views.UserShow({model : this.model}),
                contentHeader :  new chorus.views.DisplayNameHeader({ model : this.model }),
                contentDetails : new chorus.views.StaticTemplate("plain_text", {text : t("users.details")})
            });

            this.sidebar = new chorus.views.UserShowSidebar({model: this.model})
        }
    });
})(jQuery, chorus.pages);
