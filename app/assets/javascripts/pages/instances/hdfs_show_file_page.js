chorus.pages.HdfsShowFilePage = chorus.pages.Base.extend({
    constructorName: "HdfsShowFilePage",
    helpId: "hadoop_instances",

    setup:function (hadoopInstanceId, path) {
        this.path = "/" + path;

        this.model = new chorus.models.HdfsFile({ hadoopInstanceId: hadoopInstanceId, path: this.path });
        this.bindings.add(this.model, "change", this.render);
        this.model.fetch();

        this.hadoopInstance = new chorus.models.HadoopInstance({id: hadoopInstanceId});
        this.hadoopInstance.fetch();
        this.dependOn(this.hadoopInstance);

        this.mainContent = new chorus.views.MainContentView({
            model:this.model,
            content:new chorus.views.HdfsShowFileView({model:this.model}),
            contentHeader:new chorus.views.HdfsShowFileHeader({ model:this.model }),
            contentDetails:new chorus.views.StaticTemplate("plain_text", {text:t("hdfs.read_only")})
        });

        this.sidebar = new chorus.views.HdfsShowFileSidebar({ model: this.model })
    },

    crumbs: function() {
        var pathLength = _.compact(this.path.split("/")).length - 1

        var instanceCrumb = this.hadoopInstance.get("name") + (pathLength > 0 ? " (" + pathLength + ")" : "");
        var fileNameCrumb = this.model.fileNameFromPath();

        return [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances"), url: "#/instances" },
            { label: this.hadoopInstance.loaded ? instanceCrumb : "..." , url: "#/hadoop_instances"},
            { label: this.model.loaded ? fileNameCrumb : "..."}
        ];
    },

    postRender: function() {
        var hadoopInstanceId = this.hadoopInstance.get("id")
        var $content = $("<ul class='hdfs_link_menu'/>");

        var $li = $("<li/>");
        $li.append($("<a/>").attr("href", "#/hadoop_instances/" + hadoopInstanceId + "/browse/").text(this.hadoopInstance.get("name")))
        $content.append($li);

        var pathElements = _.initial(_.compact(this.path.split("/")))
        var maxLength = 20

        _.each(pathElements, function(path, index, arr) {
            var shortPath = (path.length <= maxLength) ? path : path.slice(0, maxLength) + "..."
            var $li = $("<li/>");
            var fullPath = _.first(arr, index + 1).join('/');
            $li.append($("<a/>").attr("href", "#/hadoop_instances/" + hadoopInstanceId + "/browse/" + fullPath).text(shortPath))
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
