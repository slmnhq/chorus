(function($, ns) {
    ns.UserShowPage = chorus.pages.Base.extend({
        crumbs : [
            { label: t("breadcrumbs.home"), url: "/" },
            { label: t("breadcrumbs.users"), url: "/users" },
            { label: t("breadcrumbs.user_profile") }
        ],
        setup : function(userName){
            this.model = new chorus.models.User({userName: userName});
            this.model.fetch();

            this.mainContent = new chorus.views.MainContentView({
                model : this.model,
                content : new chorus.views.UserShow({model : this.model}),
                contentHeader : new updatingUserNameView({model: this.model}),
                contentDetails : new chorus.views.StaticTemplate("plain_text", {text : t("users.details")}),
            });

            this.sidebar = new chorus.views.UserShowSidebar({model: this.model})
        }
    });

    // This is necessary because this needs to update itself when the model finishes fetching
    var updatingUserNameView = chorus.views.Base.extend({
        className : "default_content_header",
        additionalContext : function(){
            var synthesizedName = this.model.loaded ? this.model.get("firstName") + ' ' + this.model.get("lastName") : '';

            return {title: synthesizedName};
        }
    });

})(jQuery, chorus.pages);
