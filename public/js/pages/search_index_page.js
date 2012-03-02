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
            workspace: new chorus.views.WorkspaceListSidebar()
        };

        // explicitly set up bindings after initializing sidebar collection
        chorus.PageEvents.subscribe("workspace:selected", this.workspaceSelected, this);
        this.mainContent.content.bind("workfile:selected", this.workfileSelected, this);
    },

    workspaceSelected: function() {
        this.renderSidebar(this.sidebars.workspace)
    },

    renderSidebar: function(sidebar) {
        this.sidebar && $(this.sidebar.el).removeClass("workspace_list_sidebar dataset_list_sidebar workfile_list_sidebar");
        this.sidebar = sidebar;
        this.model = this.sidebar.model;
        this.renderSubview('sidebar');
        this.trigger('resized');
    },

    workfileSelected: function(workfile) {
        this.sidebars.workfile.setWorkfile(workfile);

        this.renderSidebar(this.sidebars.workfile)
    },

    postRender: function() {
        this.$('li.result_item').eq(0).click()
    }
});
