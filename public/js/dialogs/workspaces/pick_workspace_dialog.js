chorus.dialogs.PickWorkspace = chorus.dialogs.Base.extend({
    className:"pick_workspace",
    persistent:true,

    events:{
        "click button.submit": "doCallback",
        "dblclick li": "doubleClick"
    },

    additionalContext:function (ctx) {
        return {
            serverErrors:this.serverErrors,
            buttonTitle: this.buttonTitle
        }
    },

    makeModel:function () {
        this.pageModel = this.options.pageModel;
        this.collection = this.collection || this.defaultWorkspaces();
        this.collection.fetchAll();
        this.bindings.add(this.collection, "reset", this.workspacesFetched);
    },

    defaultWorkspaces: function() {
        if(this.options.activeOnly || (this.options.launchElement && this.options.launchElement.data("activeOnly"))) {
            return chorus.session.user().activeWorkspaces();
        }
        return chorus.session.user().workspaces();
    },

    workspacesFetched: function() {
        this.render();
    },

    setup:function () {
        this.picklistView = new chorus.views.CollectionPicklist({ collection:this.collection });
        this.picklistView.bind("item:selected", this.itemSelected, this);
    },

    postRender:function () {
        this.picklistView.render();
        this.$(".dialog_content .picklist").append(this.picklistView.el);
        this.picklistView.delegateEvents();
    },

    itemSelected:function (item) {
        this.$("button.submit").prop("disabled", !item);
    },

    doCallback : function () {
        this.callback && this.callback();
    },

    doubleClick: function(e) {
        this.picklistView.selectItem(e);
        this.doCallback();
    }
});
