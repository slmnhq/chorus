(function() {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs: function() {
            return [
                {label: t("breadcrumbs.home"), url: "#/"},
                {label: t("breadcrumbs.workspaces"), url: '#/workspaces'},
                {label: this.model.displayShortName(), url: this.model.showUrl()},
                {label: t("breadcrumbs.workspaces_data")}
            ];
        }
    });

    chorus.pages.DatasetIndexPage = chorus.pages.Base.extend({
        helpId: "datasets",

        setup: function(workspaceId) {
            this.workspace = new chorus.models.Workspace({id: workspaceId});
            this.workspace.onLoaded(this.workspaceLoaded, this);
            this.requiredResources.add(this.workspace);
            this.workspace.fetch();
            this.breadcrumbs = new breadcrumbsView({model: this.workspace});

            this.collection = new chorus.collections.DatasetSet([], {workspaceId: workspaceId});
            this.collection.sortAsc("objectName");

            this.subNav = new chorus.views.SubNav({workspace: this.workspace, tab: "datasets"});
            this.mainContent = new chorus.views.MainContentList({
                modelClass: "Dataset",
                collection: this.collection,
                model: this.workspace,
                linkMenus: {
                    type: {
                        title: t("header.menu.filter.title"),
                        options: [
                            {data: "", text: t("dataset.header.menu.filter.all")},
                            {data: "SOURCE_TABLE", text: t("dataset.header.menu.filter.source")},
                            {data: "CHORUS_VIEW", text: t("dataset.header.menu.filter.chorus_views")},
                            {data: "SANDBOX_TABLE", text: t("dataset.header.menu.filter.sandbox")}
                        ],
                        event: "filter"
                    }
                },
                buttons: [
                    {
                        view: "DatasetImport",
                        text: t("dataset.import.title"),
                        dataAttributes : [ {name: 'workspace-id', value: workspaceId} ],
                        helpText: t("dataset.import.need_sandbox", {hereLink: '<a class="dialog" href="#" data-dialog="SandboxNew" data-workspace-id="'+this.workspace.get("id")+'">'+t("actions.click_here")+'</a>'}),
                        disabled: true
                    }
                ]
            });

            this.sidebar = new chorus.views.DatasetListSidebar();

            chorus.PageEvents.subscribe("dataset:selected", function(dataset) {
                this.model = dataset;
            }, this);

            chorus.PageEvents.subscribe("csv_import:started", function() {
                this.collection.fetch();
            }, this)

            this.mainContent.contentHeader.bind("choice:filter", function(choice) {
                this.collection.attributes.type = choice;
                this.collection.fetch();
            }, this)
        },

        workspaceLoaded: function() {
            var targetButton = this.mainContent.options.buttons[0];

            if (this.workspace.sandbox()) {
                targetButton.dataAttributes.push({name: "canonical-name", value: this.workspace.sandbox().canonicalName()});
                targetButton.disabled = false;
                delete targetButton.helpText;
                this.mainContent.contentDetails.render();
                this.account = this.workspace.sandbox().instance().accountForCurrentUser();
                this.account.onLoaded(this.checkAccount, this);
                this.account.fetch();
            } else {
                var loggedInUser = chorus.session.user();

                if (loggedInUser.get("id") != this.workspace.get("ownerId") &&
                    !loggedInUser.get("admin"))
                {
                    targetButton.helpText = t("dataset.import.need_sandbox_no_permissions");
                    this.mainContent.contentDetails.render();
                }

                this.collection.fetch();
            }
        },

        checkAccount: function() {
            if (this.account.get('id')) {
                this.collection.fetch();
            } else {
                if (chorus.session.sandboxPermissionsCreated[this.workspace.get("id")]) {
                    this.collection.fetch();
                }
                else {
                    this.dialog = new chorus.dialogs.WorkspaceInstanceAccount({model: this.account, pageModel: this.workspace});
                    this.dialog.launchModal();
                    this.collection.loaded = true;
                    this.collection.trigger('reset');
                    this.account.bind('saved', function() {
                        this.collection.fetch();
                    }, this);
                    chorus.session.sandboxPermissionsCreated[this.workspace.get("id")] = true;
                }
            }
        }
    });
})();
