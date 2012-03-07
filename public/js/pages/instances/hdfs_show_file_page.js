chorus.pages.HdfsShowFilePage = chorus.pages.Base.extend({
    constructorName: "HdfsShowFilePage",

    setup:function (instanceId, path) {
        this.path = "/" + path;

        this.model = new chorus.models.HdfsFile({ instanceId: instanceId, path: encodeURIComponent(this.path) });
        this.model.fetch()
        this.requiredResources.push(this.model)

        this.instance = new chorus.models.Instance({id: instanceId});
        this.instance.fetch();
        this.requiredResources.push(this.instance);
    },

    resourcesLoaded: function() {
        var pathLength = _.compact(this.path.split("/")).length - 1

        this.crumbs = [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances"), url: "#/instances" },
            { label: this.instance.get("name") + (pathLength > 0 ? " (" + pathLength + ")" : "") , url: "#/instances"},
            { label: this.model.fileNameFromPath()}
        ];

        this.mainContent = new chorus.views.MainContentView({
            model:this.model,
            content:new chorus.views.HdfsShowFileView({model:this.model}),
            contentHeader:new chorus.views.HdfsShowFileHeader({ model:this.model }),
            contentDetails:new chorus.views.StaticTemplate("plain_text", {text:t("hdfs.read_only")})
        });

        this.render();
    }
})