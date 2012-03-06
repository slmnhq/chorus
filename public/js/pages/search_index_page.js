chorus.pages.SearchIndexPage = chorus.pages.Base.extend({
    crumbs: [
        { label: t("breadcrumbs.home"), url: "#/" },
        { label: t("breadcrumbs.search_results") }
    ],

    setup: function() {
        var type, query;
        if(arguments.length > 1){
            type = decodeURIComponent(arguments[0])
            query = decodeURIComponent(arguments[1]);
        } else {
            type = "all";
            query = decodeURIComponent(arguments[0]);
        }
        this.model = new chorus.models.SearchResult({query: query, type: type});
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
                        chosen: t("search.type." + this.model.get("type")),
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
            tabularData: new chorus.views.TabularDataListSidebar({browsingSchema: true})
        };

        // explicitly set up bindings after initializing sidebar collection
        chorus.PageEvents.subscribe("workspace:selected", this.workspaceSelected, this);
        chorus.PageEvents.subscribe("tabularData:selected", this.tabularDataSelected, this);
        chorus.PageEvents.subscribe("workfile:selected", this.workfileSelected, this);
        chorus.PageEvents.subscribe("user:selected", this.userSelected, this);

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

    filterSearchResults: function(type) {
        chorus.router.navigate("#/search/" + type + "/" + encodeURIComponent(this.model.get("query")), true);
    }
});
