chorus.pages.HdfsShowFilePage = chorus.pages.Base.extend({
    constructorName: "HdfsShowFilePage",

    setup:function (instanceId, path) {
        this.path = "/" + path;
        this.fileName = _.last(this.path.split("/"));

        this.model = new chorus.models.HdfsFile({ instanceId: instanceId, path: encodeURIComponent(this.path) });
        this.model.fetch()
        this.requiredResources.push(this.model)

        this.instance = new chorus.models.Instance({id: instanceId});
        this.instance.fetch();
        this.requiredResources.push(this.instance);

        // move to model???
        this.iconUrl = chorus.urlHelpers.fileIconUrl(_.last(this.fileName.split(".")));

        this.mainContent = new chorus.views.HdfsShowFileView();
    },

    resourcesLoaded: function() {
        var pathLength = _.compact(this.path.split("/")).length - 1

        this.crumbs = [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances"), url: "#/instances" },
            { label: this.instance.get("name") + (pathLength > 0 ? " (" + pathLength + ")" : "") , url: "#/instances"},
            { label: this.fileName}
        ];
    }
})