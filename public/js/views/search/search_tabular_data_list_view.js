chorus.views.SearchTabularDataList = chorus.views.Base.extend({
    className: "search_tabular_data_list",
    additionalClass: "list",

    events: {
        "click a.more_comments": "onMoreCommentsClicked",
        "click a.fewer_comments": "onLessCommentsClicked",
        "clicl a.other": "onOtherWorkspacesClicked"
    },

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.collection.attributes.total,
            moreResults: (this.collection.length < this.collection.attributes.total)
        }
    },

    collectionModelContext: function(model) {
        var comments = model.get("comments") || [];

        var context = {
            showUrl: model.showUrl(),
            iconUrl: model.iconUrl(),
            comments: comments.slice(0, 3),
            moreCommentCount: Math.max(0, comments.length - 3),
            moreComments: comments.slice(3)
        };

        var workspaces = model.get("workspaces");
        if (workspaces && workspaces.length > 0) {
            var workspace = new chorus.models.Workspace({id: workspaces[0].id, name: workspaces[0].name});
            var otherWorkspaces = _.map(workspaces.slice(1), function(workspaceJson) {
                var model = new chorus.models.Workspace(workspaceJson);
                return { name: model.get("name"), showUrl: model.showUrl() };
            });
            var otherWorkspacesMessage = chorus.helpers.pluralize(
                otherWorkspaces.length,
                "search.other_workspace_count",
                { hash: { count: otherWorkspaces.length } }
            );

            _.extend(context, {
                workspaceLink: chorus.helpers.linkTo(workspace.showUrl(), workspace.get("name")),
                otherWorkspacesLink: chorus.helpers.linkTo("#", otherWorkspacesMessage, {class: "other" }),
                otherWorkspaces: otherWorkspaces,
                hasWorkspaces: true,
                hasOtherWorkspaces: otherWorkspaces.length > 0
            });
        }

        return context;
    },

    postRender: function() {
        var lis = this.$("li");

        _.each(this.collection.models, function(model, index) {
            var $li = lis.eq(index);
            $li.find("a.instance, a.database").data("instance", model.get("instance"));

            chorus.menu($li.find(".location .workspace a.other"), {
                content: $li.find(".other_workspaces_menu_container").html()
            });
        });
    },

    onLessCommentsClicked: function(e) {
        e.preventDefault();
        this.$("div.more_comments").addClass("hidden");
        this.$("a.more_comments").removeClass("hidden");
    },

    onMoreCommentsClicked: function(e) {
        e.preventDefault();
        this.$("a.more_comments").addClass("hidden");
        this.$("div.more_comments").removeClass("hidden");
    },

    onOtherWorkspacesClicked: function(e) {
        e.preventDefault();


    }
});
