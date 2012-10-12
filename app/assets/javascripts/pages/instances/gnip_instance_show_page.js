chorus.pages.GnipInstanceShowPage = chorus.pages.Base.extend({
    setup: function(id) {
        this.model = new chorus.models.GnipInstance({id: id});
        this.dependOn(this.model);
        this.model.fetch();

        this.mainContent = new chorus.views.MainContentView({
            model: this.model,
            contentHeader: new chorus.views.DisplayNameHeader({model: this.model, imageUrl: '/images/instances/gnip.png'})
        });

        // TODO: This should be refactored to use a less general view
        this.sidebar = new chorus.views.InstanceListSidebar();
        this.sidebar.setInstance(this.model);
    },

    crumbs: function() {
        return [
            {label: t("breadcrumbs.home"), url: "#/"},
            {label: t("breadcrumbs.instances"), url: "#/instances"},
            {label: this.model.name()}
        ];
    }
});
