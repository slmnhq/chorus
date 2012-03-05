chorus.views.HdfsDirectoryEntrySidebar = chorus.views.Sidebar.extend({
    constructorName: "HdfsDirectoryEntrySidebar",
    className: "hdfs_directory_entry_sidebar",

    subviews: {
        '.activity_list': 'activityList',
        '.tab_control': 'tabControl'
    },

    setup: function() {
        chorus.PageEvents.subscribe("hdfs_entry:selected", this.setEntry, this);
        this.tabControl = new chorus.views.TabControl([ {name: 'activity', selector: ".activity_list"} ]);
    },

    setEntry: function(entry) {
        this.resource = entry;
        if (entry) {
            entry.entityId = this.makeEntityId();

            var activities = entry.activities();
            activities.fetch();
            this.activityList = new chorus.views.ActivityList({
                collection: activities,
                additionalClass: "sidebar",
                type: t("hdfs." + (entry.get("isDir") ? "directory" : "file"))
            });

            this.activityList.bind("content:changed", this.recalculateScrolling, this)
        } else {
            delete this.activityList;
        }

        this.render();
    },

    additionalContext: function() {
        return {
            entityId: this.makeEntityId(),
            lastUpdatedStamp: t("hdfs.last_updated", { when : chorus.helpers.relativeTimestamp(this.resource.get("lastModified"))})
        }
    },

    makeEntityId: function() {
        if (this.resource) {
            return this.options.instanceId + "|" + encodeURIComponent(this.options.rootPath + "/" +this.resource.get("name"));
        }
    }
});