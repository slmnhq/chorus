chorus.views.HdfsShowFileSidebar = chorus.views.Sidebar.extend({
    className: "hdfs_show_file_sidebar",
    constructorName: "HdfsShowFileSidebar",

    events: {
        "click a.external_table": "createExternalTable"
    },

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

        this.activityList.bind("content:changed", this.recalculateScrolling, this);
        chorus.PageEvents.subscribe("csv_import:started", function() {activities.fetch()}, this)
    },

    additionalContext: function() {
        return {
            fileName: this.model.fileNameFromPath(),
            encodedEntityId: this.makeEncodedEntityId(),
            lastUpdated: t("hdfs.last_updated", { when: chorus.helpers.relativeTimestamp(this.model.get('lastModificationTime')) })
        }
    },

    makeEncodedEntityId: function() {
        return encodeURIComponent(this.model.get("instanceId") + "|" + this.model.get("path"));
    },

    createExternalTable: function(e) {
        e && e.preventDefault();

        var csv = new chorus.models.CsvHdfs({
            instanceId: this.model.get("instanceId"),
            toTable: this.model.fileNameFromPath(),
            path: this.model.get("path")
        });
        csv.fetch();

        csv.onLoaded(function(){
            var dialog = new chorus.dialogs.CreateExternalTableFromHdfs({csv: csv});
            dialog.launchModal();
        });
    }
})
