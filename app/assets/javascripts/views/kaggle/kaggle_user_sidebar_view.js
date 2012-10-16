chorus.views.KaggleUserSidebar = chorus.views.Sidebar.extend({
    templateName:"kaggle/user_sidebar",

    events: {
        "click .multiple_selection .sendMessage": "launchMultipleUserKaggleSendMessageDialog",
        "click .actions .sendMessage": "launchSingleUserKaggleSendMessageDialog"
    },

    subviews: {
        '.tab_control': 'tabs'
    },

    setup: function(options) {
        this.workspace = options.workspace;
        chorus.PageEvents.subscribe("kaggleUser:selected", this.setKaggleUser, this);
        chorus.PageEvents.subscribe("kaggleUser:checked", this.kaggleUserChecked, this);
        this.tabs = new chorus.views.TabControl(["information"]);
    },

    postRender: function(){
        this.showOrHideMultipleSelectionSection();
    },

    setKaggleUser: function(user) {
        this.resource = this.model = user;
        this.tabs.information = new chorus.views.KaggleUserInformation({
            model: user
        });
        this.render();
        this.showOrHideMultipleSelectionSection();
    },

    kaggleUserChecked: function(checkedKaggleUsers) {
        this.checkedKaggleUsers = checkedKaggleUsers;
        this.showOrHideMultipleSelectionSection();
    },

    showOrHideMultipleSelectionSection: function() {
        var multiSelectEl = this.$(".multiple_selection");
        var numChecked = this.checkedKaggleUsers ? this.checkedKaggleUsers.length : 0;
        multiSelectEl.toggleClass("hidden", numChecked <= 1);
        multiSelectEl.find(".count").text(t("kaggle.sidebar.multiple_selection.count", { count: numChecked }))
    },

    launchMultipleUserKaggleSendMessageDialog: function(e) {
        e.preventDefault();
        new chorus.dialogs.ComposeKaggleMessage({recipients: this.checkedKaggleUsers, workspace: this.workspace}).launchModal();
    },

    launchSingleUserKaggleSendMessageDialog: function(e) {
        e.preventDefault();
        new chorus.dialogs.ComposeKaggleMessage(
            { recipients: new chorus.collections.KaggleUserSet([this.resource]),
              workspace: this.workspace
            }).launchModal();
    },

    postRender: function() {
        this.$('.actions a.sendMessage').data('recipients', new chorus.collections.KaggleUserSet([this.model]));
        this.$('.actions a.sendMessage').data('workspace', this.workspace);
    }
});
