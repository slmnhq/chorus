chorus.views.HdfsShowFileSidebar = chorus.views.Sidebar.extend({
    templateName: "hdfs_show_file_sidebar",
    constructorName: "HdfsShowFileSidebar",

    events: {
        "click a.external_table": "createExternalTable"
    },

    subviews:{
        '.tab_control': 'tabs'
    },

    setup: function() {
        this.tabs = new chorus.views.TabControl(["activity"])
        this.tabs.activity && this.tabs.activity.collection.fetch();

        this.model.entityId = this.getEntityId();

        var activities = this.model.activities();
        activities.fetch();

        this.bindings.add(activities, "changed", this.render);
        this.bindings.add(activities, "reset", this.render);

        this.tabs.activity = new chorus.views.ActivityList({
            collection: activities,
            additionalClass: "sidebar",
            type: t("hdfs.file")
        });

        chorus.PageEvents.subscribe("csv_import:started", function() {activities.fetch()}, this)
    },

    additionalContext: function() {
        return {
            fileName: this.model.fileNameFromPath(),
            entityId: this.getEntityId(),
            lastUpdated: t("hdfs.last_updated", { when: chorus.helpers.relativeTimestamp(this.model.get('lastUpdatedStamp')) })
        }
    },

    getEntityId: function() {
        return this.model.get("instanceId") + "|" + this.model.get("path");
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
