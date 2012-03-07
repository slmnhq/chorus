chorus.views.HdfsShowFileSidebar = chorus.views.Sidebar.extend({
    className: "hdfs_show_file_sidebar",
    constructorName: "HdfsShowFileSidebar",

    subviews:{
        '.activity_list': 'activityList',
        '.tab_control': 'tabControl'
    },

    setup: function() {
        this.tabControl = new chorus.views.TabControl([ {name: 'activity', selector: ".activity_list"} ])
        this.activityList && this.activityList.collection.fetch();

        this.model.entityId = this.makeEncodedEntityId();

        var activities = this.model.activities();
        activities.fetch();

        this.bindings.add(activities, "changed", this.render);
        this.bindings.add(activities, "reset", this.render);

        this.activityList = new chorus.views.ActivityList({
            collection: activities,
            additionalClass: "sidebar",
            type: t("hdfs.file")
        });

        this.activityList.bind("content:changed", this.recalculateScrolling, this)
    },

    additionalContext: function() {
        return {
            fileName: this.model.fileNameFromPath(),
            encodedEntityId: this.makeEncodedEntityId(),
            lastUpdated: t("hdfs.last_updated", { when: chorus.helpers.relativeTimestamp(this.model.get('lastModificationTime')) })
        }
    },

    makeEncodedEntityId: function() {
        return encodeURIComponent(this.model.get("instanceId") + "|") + this.model.get("path");
    }
})
