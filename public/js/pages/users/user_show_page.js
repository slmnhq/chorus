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
            this.mainContent = new chorus.views.UserShowMain(this.model);
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

    chorus.views.UserShowMain = chorus.views.MainContentView.extend({
        setup : function(model) {
            this.resource = this.model = model;
            this.content = new chorus.views.UserShow({model : model});
            this.contentHeader = new updatingUserNameView({model: model});
            this.contentDetails = new chorus.views.StaticTemplate("plain_text", {text : t("users.details")});
        }
    });
})(jQuery, chorus.pages);