chorus.pages.HdfsShowFilePage = chorus.pages.Base.extend({
    constructorName: "HdfsShowFilePage",
    helpId: "hadoop_instances",

    setup:function (hadoopInstanceId, id) {
        this.model = new chorus.models.HdfsEntry({ hadoopInstance: {id: hadoopInstanceId}, id: id });
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
        var pathLength = _.compact(this.model.getPath().split("/")).length - 1

        var instanceCrumb = this.hadoopInstance.get("name") + (pathLength > 0 ? " (" + pathLength + ")" : "");
        var fileNameCrumb = this.model.get("name");

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

        var pathSegments = this.model.pathSegments();
        var maxLength = 20;

        _.each(pathSegments, function(hdfsEntry) {
            var link = $("<a></a>").attr('href', hdfsEntry.showUrl()).text(_.truncate(hdfsEntry.get('name'), maxLength));
            $content.append($("<li></li>").append(link));
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
