chorus.pages.GnipInstanceShowPage = chorus.pages.Base.extend({
    setup: function(id) {
        this.model = new chorus.models.GnipInstance({id: id});
        this.dependOn(this.model);
        this.model.fetch();

        this.mainContent = new chorus.views.MainContentView({
            model: this.model,
            contentHeader: new chorus.views.DisplayNameHeader({model: this.model, imageUrl: '/images/instances/gnip.png'})
    });
    },

    crumbs: function() {
        return [
            {label: t("breadcrumbs.home"), url: "#/"},
            {label: t("breadcrumbs.instances"), url: "#/instances"},
            {label: this.model.name()}
        ];
    }
});
