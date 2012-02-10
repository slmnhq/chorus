chorus.dialogs.PickWorkspace = chorus.dialogs.Base.extend({
    className:"pick_workspace",

    persistent:true,

    events:{
        "click button.submit":"doCallback"
    },

    additionalContext:function (ctx) {
        return {
            serverErrors:this.serverErrors,
            buttonTitle: this.buttonTitle
        }
    },

    makeModel:function () {
        this.pageModel = this.options.pageModel;
        this.collection = this.collection || chorus.session.user().workspaces();
        this.collection.fetchAll();
        this.collection.bind("reset", this.workspacesFetched, this);
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
        if (item) {
            this.$("button.submit").removeAttr("disabled");
        }
        else {
            this.$("button.submit").attr("disabled", "disabled");
        }
    },

    doCallback : function () {
        this.callback && this.callback();
    }
});
