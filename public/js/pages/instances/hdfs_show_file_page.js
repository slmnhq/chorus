chorus.pages.HdfsShowFilePage = chorus.pages.Base.extend({
    constructorName: "HdfsShowFilePage",

    setup:function (instanceId, path) {
        this.path = "/" + path;

        this.model = new chorus.models.HdfsFile({ instanceId: instanceId, path: this.path });
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

        this.sidebar = new chorus.views.HdfsShowFileSidebar({ model: this.model })
        this.render();
    },

    postRender: function() {
        var instanceId = this.instance.get("id")
        var $content = $("<ul class='hdfs_link_menu'/>");

        var $li = $("<li/>");
        $li.append($("<a/>").attr("href", "#/instances/" + instanceId + "/browse/").text(this.instance.get("name")))
        $content.append($li);

        var pathElements = _.initial(_.compact(this.path.split("/")))
        var maxLength = 20

        _.each(pathElements, function(path, index, arr) {
            var shortPath = (path.length <= maxLength) ? path : path.slice(0, maxLength) + "..."
            var $li = $("<li/>");
            var fullPath = _.first(arr, index + 1).join('/');
            $li.append($("<a/>").attr("href", "#/instances/" + instanceId + "/browse/" + fullPath).text(shortPath))
            $content.append($li);
        });

        chorus.menu(this.$(".breadcrumb").eq(2), {
            content: $content,

            qtipArgs: {
                show: { event: "mouseenter"},
                hide: { event: "mouseleave", delay: 500, fixed: true }
            }
        });
    },

    ellipsizePath: function() {
        var folders = this.path.split('/')
        if (folders.length > 3) {
            return "/" + folders[1] + "/.../" + folders[folders.length - 1]
        } else {
            return this.path
        }
    }
})
