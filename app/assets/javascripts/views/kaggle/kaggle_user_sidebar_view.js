chorus.views.KaggleUserSidebar = chorus.views.Sidebar.extend({
    templateName:"kaggle/user_sidebar",

    subviews: {
        '.tab_control': 'tabs'
    },

    setup: function() {
        chorus.PageEvents.subscribe("kaggle_user:selected", this.setKaggleUser, this);
        this.tabs = new chorus.views.TabControl(["information"]);
    },

    setKaggleUser: function(user) {
        this.resource = this.model = user;
        this.tabs.information = new chorus.views.KaggleUserInformation({
            model: user
        });
        this.render();
    }
});
