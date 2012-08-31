chorus.pages.HdfsEntryIndexPage = chorus.pages.Base.extend({
    helpId: "instances",

    setup:function (hadoopInstanceId, id) {
        this.instance = new chorus.models.HadoopInstance({ id: hadoopInstanceId });
        this.instance.fetch();
        this.bindings.add(this.instance, "loaded", this.instanceFetched);
        this.hadoopInstanceId = hadoopInstanceId;


        this.hdfsEntry = new chorus.models.HdfsEntry({
            id: id,
            hadoopInstance: {
                id: hadoopInstanceId
            }
        });
        this.hdfsEntry.fetch();
        this.bindings.add(this.hdfsEntry, "loaded", this.entryFetched);



        chorus.PageEvents.subscribe("hdfs_entry:selected", this.entrySelected, this)


    },

    crumbs: function() {
        var path = this.hdfsEntry.get("path") || "";
        var pathLength = _.compact(path.split("/")).length + 1;
        var modelCrumb = this.instance.get("name") + (pathLength > 0 ? " (" + pathLength + ")" : "");
        return [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances"), url: "#/instances" },
            { label: this.instance.loaded ? modelCrumb : "..." }
        ];
    },

    everythingLoaded: function() {
        this.mainContent = new chorus.views.MainContentList({
            modelClass: "HdfsEntry",
            collection: this.collection
        });

        this.sidebar = new chorus.views.HdfsEntrySidebar({
            rootPath: this.path,
            hadoopInstanceId: this.hadoopInstanceId
        });

        this.mainContent.contentHeader.options.title = this.instance.get("name") + ": " + this.ellipsizePath();
        this.render();
    },

    instanceFetched: function() {
        if(this.hdfsEntry.loaded) {
            this.everythingLoaded();
        }
    },

    entryFetched: function() {
        this.collection = new chorus.collections.HdfsEntrySet(this.hdfsEntry.get("entries"), {
            hadoopInstance: {
                id: this.hadoopInstanceId
            }
        });

        this.collection.loaded = true;

        if(this.instance.loaded) {
            this.everythingLoaded();
        }
    },

    postRender: function() {
        if (this.path === "/") {
            return;
        }

        var $content = $("<ul class='hdfs_link_menu'/>");

        var $li = $("<li/>");
//        $li.append(chorus.helpers.linkTo(this.instance.showUrl(), this.instance.get("name")).toString());
//        $content.append($li);

        var pathSegments = this.hdfsEntry.pathSegments();
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
        var path = this.hdfsEntry.get("path") || ""
        var folders = path.split('/');
        if (folders.length > 3) {
            return "/" + folders[1] + "/.../" + folders[folders.length-1]
        } else {
            return path
        }
    },

    entrySelected : function(model) {
        this.model = model;
    }
});
