chorus.pages.HdfsEntryIndexPage = chorus.pages.Base.include(
    chorus.Mixins.InstanceCredentials.page
).extend({
    helpId: "instances",

    setup:function (instance_id, path) {
        this.path = "/" + path;
        this.instance = new chorus.models.HadoopInstance({ id: instance_id });
        this.instance.fetch();
        this.bindings.add(this.instance, "loaded", this.entriesFetched);

        this.collection = this.instance.entriesForPath(this.path);
        this.collection.fetch();

        chorus.PageEvents.subscribe("hdfs_entry:selected", this.entrySelected, this)

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "HdfsEntry",
            collection: this.collection
        });

        this.sidebar = new chorus.views.HdfsEntrySidebar({
            rootPath: this.path,
            instance_id: instance_id
        });
    },

    crumbs: function() {
        var pathLength = _.compact(this.path.split("/")).length;
        var modelCrumb = this.instance.get("name") + (pathLength > 0 ? " (" + pathLength + ")" : "");
        return [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances"), url: "#/instances" },
            { label: this.instance.loaded ? modelCrumb : "..." }
        ];
    },

    entriesFetched: function() {
        this.mainContent.contentHeader.options.title = this.instance.get("name") + ": " + this.ellipsizePath();
        this.render();
    },

    postRender: function() {
        if (this.path === "/") {
            return;
        }

        var $content = $("<ul class='hdfs_link_menu'/>");

        var $li = $("<li/>");
        $li.append(chorus.helpers.linkTo(this.instance.showUrl(), this.instance.get("name")).toString());
        $content.append($li);

        var pathSegments = this.collection.hdfsEntry().pathSegments();
        var maxLength = 20

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
            return "/" + folders[1] + "/.../" + folders[folders.length-1]
        } else {
            return this.path
        }
    },

    entrySelected : function(model) {
        this.model = model;
    }
});
