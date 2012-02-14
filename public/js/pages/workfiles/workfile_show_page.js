(function () {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs:function () {
            return [
                {label:t("breadcrumbs.home"), url:"#/"},
                {label:t("breadcrumbs.workspaces"), url:'#/workspaces'},
                {label:this.options.workspace.displayShortName(20), url:this.options.workspace.showUrl()},
                {label:t("breadcrumbs.workfiles.all"), url:this.options.workspace.showUrl() + "/workfiles"},
                {label:this.model.get("fileName") }
            ];
        }
    });

    chorus.pages.WorkfileShowPage = chorus.pages.Base.extend({
        helpId: "workfile",

        events:function () {
            var superClassEvents = this._super("events");
            return _.extend({}, superClassEvents, {
                "keydown":"handleShortcut"
            });
        },

        handleShortcut:function () {
        },

        setup:function (workspaceId, workfileId, versionNum) {
            this.model = new chorus.models.Workfile({id:workfileId, workspaceId:workspaceId});
            if (versionNum) {
                this.model.set({ versionInfo : { versionNum: versionNum } }, { silent:true })
            }

            this.model.fetch();
            this.model.workspace().fetch();
            this.requiredResources.push(this.model);
            this.requiredResources.push(this.model.workspace());

            chorus.PageEvents.subscribe("file:autosaved", function () {
                this.model && this.model.trigger("invalidated");
            }, this);
        },

        resourcesLoaded:function () {
            this.breadcrumbs = new breadcrumbsView({workspace:this.model.workspace(), model:this.model});
            this.sidebar = new chorus.views.WorkfileShowSidebar({model:this.model});
            this.subNav = new chorus.views.SubNav({workspace:this.model.workspace(), tab:"workfiles"});

            this.mainContent = new chorus.views.MainContentView({
                model:this.model,
                contentHeader:new chorus.views.WorkfileHeader({model:this.model})
            });
            this.bindings.add(this.model, "change", this.modelChanged);
            this.modelChanged();
        },

        modelChanged:function () {
            if (this.model.isLatestVersion() && this.model.get("hasDraft") && !this.model.isDraft) {
                var alert = new chorus.alerts.WorkfileDraft({model:this.model});
                alert.launchModal();
            }
            if (!this.mainContent.contentDetails) {
                this.mainContent.contentDetails = chorus.views.WorkfileContentDetails.buildFor(this.model);
                this.mainContent.content = chorus.views.WorkfileContent.buildFor(this.model);
            }

            this.render();
        }
    });

    chorus.views.WorkfileHeader = chorus.views.Base.extend({
        className:"workfile_header",
        additionalContext:function () {
            return {
                iconUrl:this.model.get("fileType") && chorus.urlHelpers.fileIconUrl(this.model.get("fileType"))
            };
        }
    });
})();
