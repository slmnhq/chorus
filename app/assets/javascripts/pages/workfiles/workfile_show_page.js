(function () {
    chorus.pages.WorkfileShowPage = chorus.pages.Base.extend({
        helpId: "workfile",

        setup: function(workspaceId, workfileId, versionNum) {
            this.workspaceId = workspaceId;
            this.model = new chorus.models.Workfile({id:workfileId, workspace: {id: workspaceId}});
            if (versionNum) {
                this.model.set({ versionInfo : { versionNum: versionNum } }, { silent:true })
            }

            this.model.fetch();
            this.workspace = this.model.workspace();
            this.workspace.fetch();
            this.dependOn(this.model, this.modelChanged);
            this.dependOn(this.workspace, this.modelChanged);

            chorus.PageEvents.subscribe("file:autosaved", function () {
                this.model && this.model.trigger("invalidated");
            }, this);

            this.mainContent = new chorus.views.MainContentView({
                model:this.model,
                content: new chorus.views.LoadingSection(),
                contentHeader:new chorus.views.WorkfileHeader({model:this.model})
            });

            this.sidebar = new chorus.views.WorkfileShowSidebar({model:this.model});
            this.subNav = new chorus.views.SubNav({workspace:this.workspace, tab:"workfiles"});
        },

        crumbs: function() {
            return [
                {label:t("breadcrumbs.home"), url:"#/"},
                {label:t("breadcrumbs.workspaces"), url:'#/workspaces'},
                {label: this.workspace.loaded ? this.workspace.displayShortName(20) : "...", url:this.workspace.showUrl()},
                {label:t("breadcrumbs.workfiles.all"), url:this.workspace.workfilesUrl()},
                {label:this.model.loaded ? this.model.get("fileName") : "..." }
            ];
        },

        modelChanged:function () {
            if (this.model.loaded && this.workspace.loaded) {
                if (this.model.isLatestVersion() && this.model.get("hasDraft") && !this.model.isDraft) {
                    var alert = new chorus.alerts.WorkfileDraft({model:this.model});
                    alert.launchModal();
                }
                if (!this.mainContent.contentDetails) {
                    this.mainContent.content = chorus.views.WorkfileContent.buildFor(this.model);
                    this.mainContent.contentDetails = chorus.views.WorkfileContentDetails.buildFor(this.model, this.mainContent.content);
                }

                this.render();
            }
        }
    });

    chorus.views.WorkfileHeader = chorus.views.Base.extend({
        templateName: "workfile_header",

        additionalContext:function () {
            return {
                iconUrl: this.model.iconUrl()
            };
        }
    });
})();
