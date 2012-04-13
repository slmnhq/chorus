chorus.views.WorkspaceQuickstart = chorus.views.Base.extend({
    constructorName: "WorkspaceQuickstartView",
    className: "workspace_quickstart",
    additionalClass: "workspace_show",
    useLoadingSection: true,

    events: {
        "click a.dismiss": "visitShowPage",
        "click .info_box a": "hideBox"
    },

    additionalContext: function() {
        return {
            workspaceUrl: this.model.showUrl()
        }
    },

    setup: function() {
        chorus.PageEvents.subscribe("modal:closed", this.dismissQuickStart, this);
        this.clickedDialogs = [];

        this.cookieId = "quickstart_" + this.model.id;
        var hasQuickstartCookie = !!$.cookie(this.cookieId);

        if (hasQuickstartCookie) {
            var cookie = JSON.parse($.cookie(this.cookieId));
            cookie.WorkspaceEditMembersDone && this.clickedDialogs.push("WorkspaceEditMembers");
            cookie.WorkspaceSettingsDone && this.clickedDialogs.push("WorkspaceSettings");
            cookie.SandboxNewDone && this.clickedDialogs.push("SandboxNew");
            cookie.WorkfilesImportDone && this.clickedDialogs.push("WorkfilesImport");
        } else {
            var quickstartCookie = {
                WorkspaceEditMembersDone: false,
                WorkspaceSettingsDone: false,
                SandboxNewDone: false,
                WorkfilesImportDone: false
            }

            $.cookie(this.cookieId, JSON.stringify(quickstartCookie));
        }
    },

    postRender: function() {
        _.each(this.clickedDialogs, function(dialogType) {
            this.getContainingBox(this.$("a[data-dialog=" + dialogType + "]")).addClass("hidden");
        }, this);
    },

    hideBox: function(e) {
        var link = $(e.currentTarget);
        var clickedBox = this.getContainingBox(link);
        var dialogName = link.data("dialog");
        this.clickedDialogs.push(dialogName);

        var cookieJson = JSON.parse($.cookie(this.cookieId));
        cookieJson[dialogName + "Done"] = true;
        $.cookie(this.cookieId, JSON.stringify(cookieJson));

        clickedBox.addClass("hidden");
    },

    getContainingBox: function(link) {
        return link.closest(".info_box");
    },

    dismissQuickStart: function() {
        var allHidden = _.all(this.$(".info_box"), function(node) {
            return $(node).hasClass("hidden");
        });

        if (allHidden) {
            chorus.router.navigate(this.model.showUrl());
        }
    },

    visitShowPage: function(e) {
        e && e.preventDefault();
        $.cookie(this.cookieId, null);
        chorus.router.navigate($(e.currentTarget).attr("href"));
    }
}, {
    quickstartFinishedFor: function(id) {
        var cookieData = JSON.parse($.cookie("quickstart_" + id));
        var finished = true;
        if (cookieData) {
            finished = (
                cookieData.WorkspaceEditMembersDone &&
                cookieData.WorkspaceSettingsDone &&
                cookieData.SandboxNewDone &&
                cookieData.WorkfilesImportDone
            );
        }

        return finished;
    }
});
