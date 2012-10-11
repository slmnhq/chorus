chorus.views.KaggleUserSidebar = chorus.views.Sidebar.extend({
    templateName:"kaggle/user_sidebar",

    setup: function() {
        chorus.PageEvents.subscribe("kaggle_user:selected", this.setKaggleUser, this);
    },

    setKaggleUser: function(user) {
        this.resource = this.model = user;
        this.render();
    }
});
