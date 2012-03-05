chorus.pages.SearchIndexPage = chorus.pages.Base.extend({
    crumbs: [
        { label: t("breadcrumbs.home"), url: "#/" },
        { label: t("breadcrumbs.search_results") }
    ],

    setup: function(query) {
        query = decodeURIComponent(query);
        this.model = new chorus.models.SearchResult({query: query});
        this.requiredResources.add(this.model);
        this.model.fetch();
    },

    resourcesLoaded: function() {
        this.mainContent = new chorus.views.MainContentView({
            contentHeader: new chorus.views.StaticTemplate("default_content_header", {
                title: t("search.index.title", {
                    query: this.model.displayShortName()
                })
            }),

            content: new chorus.views.SearchResultList({ model: this.model })
        });

        this.sidebars = {
            workfile: new chorus.views.WorkfileListSidebar({ hideAddNoteLink: true }),
            workspace: new chorus.views.WorkspaceListSidebar(),
            tabularData: new chorus.views.TabularDataListSidebar({browsingSchema: true})
        };

        // explicitly set up bindings after initializing sidebar collection
        chorus.PageEvents.subscribe("workspace:selected", this.workspaceSelected, this);
        chorus.PageEvents.subscribe("tabularData:selected", this.tabularDataSelected, this);
        chorus.PageEvents.subscribe("workfile:selected", this.workfileSelected, this);
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

    renderSidebar: function(sidebar) {
        this.sidebar && $(this.sidebar.el).removeClass("workspace_list_sidebar dataset_list_sidebar workfile_list_sidebar");
        this.sidebar = sidebar;
        this.renderSubview('sidebar');
        this.trigger('resized');
    },

    postRender: function() {
        this.$('li.result_item').eq(0).click()
    }
});
