chorus.views.UserShowSidebar = chorus.views.Sidebar.extend({
    className:"user_show_sidebar",
    entityType:"user",
    subviews:{
        '.activities':'activityList'
    },

    setup:function () {
        this.collection = this.model.activities();
        this.collection.fetch();
        this.collection.bind("changed", this.render, this);
        this.activityList = new chorus.views.ActivityList({ collection:this.collection, headingText:t("user.activity"), additionalClass:"sidebar" });
    },

    additionalContext:function () {
        return {
            permission:((this.model.get("userName") == chorus.session.user().get("userName")) || chorus.session.user().get("admin"))
        }
    }
});

chorus.alerts.UserDelete = chorus.alerts.Base.extend({
})