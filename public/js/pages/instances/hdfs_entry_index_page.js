chorus.pages.HdfsEntryIndexPage = chorus.pages.Base.extend({
    setup:function (instanceId, path) {
        this.path = "/" + path;
        this.instance = new chorus.models.Instance({id: instanceId});
        this.instance.fetch();
        this.requiredResources.push(this.instance);

        this.collection = new chorus.collections.HdfsEntrySet([], {instance: this.instance, path: this.path});
        this.collection.fetch();
        this.requiredResources.push(this.collection);
        chorus.PageEvents.subscribe("hdfs_entry:selected", this.entrySelected, this)
    },

    requiredResourcesFetchFailed: function(collection) {
        var errorMessage = collection.serverErrors[0] && collection.serverErrors[0].message
        if (errorMessage.match(/Account.*map.*needed/)) {
            var dialog = new chorus.dialogs.InstanceAccount({ title: t("instances.account.add.title"), pageModel: this.instance, reload: true });
            dialog.launchModal();
        } else {
            this._super("requiredResourcesFetchFailed", arguments);
        }
    },

    resourcesLoaded: function() {
        var pathLength = _.compact(this.path.split("/")).length
        this.crumbs = [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances"), url: "#/instances" },
            { label: this.instance.get("name") + (pathLength > 0 ? " (" + pathLength + ")" : "") }
        ];

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "HdfsEntry",
            collection: this.collection,
            title: this.instance.get("name") + ": " + this.ellipsizePath()
        });

        this.sidebar = new chorus.views.HdfsEntrySidebar({
            rootPath: this.path,
            instanceId: this.instance.get("id")
        });
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
