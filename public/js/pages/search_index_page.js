chorus.pages.SearchIndexPage = chorus.pages.Base.extend({
    crumbs: [
        { label: t("breadcrumbs.home"), url: "#/" },
        { label: t("breadcrumbs.search_results") }
    ],

    setup: function() {
        var attrs = {
            query: decodeURIComponent(arguments[2] || arguments[0])
        };
        if (arguments.length === 3) {
            attrs.searchIn = arguments[0];
            attrs.entityType = arguments[1];
        }
        this.model = this.search = new chorus.models.SearchResult(attrs);
        this.requiredResources.add(this.model);
        this.model.fetch();
    },

    resourcesLoaded: function() {
        this.mainContent = new chorus.views.MainContentView({
            contentHeader: new chorus.views.ListHeaderView({
                title: t("search.index.title", {
                    query: this.model.displayShortName()
                }),
                linkMenus: {
                    search_in: {
                        title: t("search.search_in"),
                        options: [
                            {data: "all", text: t("search.in.all_of_chorus")},
                            {data: "my_workspaces", text: t("search.in.my_workspaces")}
                        ],
                        event: "search_in"
                    },
                    type: {
                        title: t("search.show"),
                        options: [
                            {data: "all", text: t("search.type.all")},
                            {data: "workfile", text: t("search.type.workfile")},
                            {data: "hadoop", text: t("search.type.hadoop")},
                            {data: "dataset", text: t("search.type.dataset")},
                            {data: "workspace", text: t("search.type.workspace")},
                            {data: "user", text: t("search.type.user")}
                        ],
                        chosen: t("search.type." + (this.search.get("entityType") || 'all')),
                        event: "filter"
                    }
                }
            }),

            content: new chorus.views.SearchResultList({ model: this.model })
        });

        this.sidebars = {
            user: new chorus.views.UserListSidebar(),
            workfile: new chorus.views.WorkfileListSidebar({ hideAddNoteLink: true }),
            workspace: new chorus.views.WorkspaceListSidebar(),
            tabularData: new chorus.views.TabularDataSidebar({listMode: true})
        };

        // explicitly set up bindings after initializing sidebar collection
        chorus.PageEvents.subscribe("workspace:selected", this.workspaceSelected, this);
        chorus.PageEvents.subscribe("tabularData:selected", this.tabularDataSelected, this);
        chorus.PageEvents.subscribe("workfile:selected", this.workfileSelected, this);
        chorus.PageEvents.subscribe("user:selected", this.userSelected, this);

        chorus.PageEvents.subscribe("choice:search_in", this.scopeSearchResults, this);
        chorus.PageEvents.subscribe("choice:filter", this.filterSearchResults, this);
    },

    workspaceSelected: function() {
        this.renderSidebar(this.sidebars.workspace);
    },

    tabularDataSelected: function() {
        this.renderSidebar(this.sidebars.tabularData);
    },

    workfileSelected: function() {
        this.renderSidebar(this.sidebars.workfile)
    },

    userSelected: function(user) {
        this.sidebars.user.setUser(user);
        this.renderSidebar(this.sidebars.user);
    },

    renderSidebar: function(sidebar) {
        this.sidebar && $(this.sidebar.el).removeClass("workspace_list_sidebar dataset_list_sidebar workfile_list_sidebar user_list_sidebar");
        this.sidebar = sidebar;
        this.renderSubview('sidebar');
        this.trigger('resized');
    },

    postRender: function() {
        this.$('li.result_item').eq(0).click()
    },

    scopeSearchResults: function(data) {
        this.search.set({ searchIn: data });
        chorus.router.navigate(this.search.showUrl(), true);
    },

    filterSearchResults: function(entityType) {
        this.search.set({ entityType: entityType });
        chorus.router.navigate(this.search.showUrl(), true);
    }
});
