chorus.pages.HdfsDirectoryEntryIndexPage = chorus.pages.Base.extend({
    setup:function (instanceId, path) {
        this.path = "/" + path;
        this.instance = new chorus.models.Instance({id: instanceId});
        this.instance.fetch();
        this.requiredResources.push(this.instance);

        this.collection = new chorus.collections.HdfsDirectoryEntrySet([], {instanceId: instanceId, path: this.path});
        this.collection.fetch();
        this.requiredResources.push(this.collection);
    },

    resourcesLoaded: function() {
        var pathLength = _.compact(this.path.split("/")).length
        this.crumbs = [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances"), url: "#/instances" },
            { label: this.instance.get("name") + (pathLength > 0 ? " (" + pathLength + ")" : "") }
        ];

        this.mainContent = new chorus.views.MainContentList({

            modelClass: "HdfsDirectoryEntry",
            collection: this.collection,
            title: this.instance.get("name") + ": " + this.ellipsizePath()
        });

        this.sidebar = new chorus.views.HdfsDirectoryEntrySidebar();
    },

    postRender: function() {
        if (this.path === "/") {
            return;
        }

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
            return "/" + folders[1] + "/.../" + folders[folders.length-1]
        } else {
            return this.path
        }
    }
});