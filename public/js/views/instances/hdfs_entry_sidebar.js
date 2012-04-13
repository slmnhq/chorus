chorus.views.HdfsEntrySidebar = chorus.views.Sidebar.extend({
    constructorName: "HdfsEntrySidebar",
    className: "hdfs_entry_sidebar",

    subviews: {
        '.tab_control': 'tabs'
    },

    events : {
        'click .external_table': 'createExternalTable'
    },

    setup: function() {
        chorus.PageEvents.subscribe("hdfs_entry:selected", this.setEntry, this);
        chorus.PageEvents.subscribe("csv_import:started", this.refreshActivities, this);
        this.tabs = new chorus.views.TabControl(["activity"]);
    },

    refreshActivities: function() {
        this.tabs.activity && this.tabs.activity.collection.fetch();
    },

    postRender: function() {
        this._super("postRender");
        if (this.resource && this.resource.get("isDir")) {
            this.$(".tab_control").addClass("hidden")
            this.$(".tabbed_area").addClass("hidden")
        } else {
            this.$(".tab_control").removeClass("hidden")
            this.$(".tabbed_area").removeClass("hidden")
        }
    },

    setEntry: function(entry) {
        this.resource = entry;
        if (entry) {
            entry.entityId = this.getEntityId();

            if (this.tabs.activity ) {
                delete this.tabs.activity ;
            }

            if (!entry.get("isDir")) {
                var activities = entry.activities();
                activities.fetch();

                this.bindings.add(activities, "changed", this.render);
                this.bindings.add(activities, "reset", this.render);

                this.tabs.activity = new chorus.views.ActivityList({
                    collection: activities,
                    additionalClass: "sidebar",
                    type: t("hdfs." + (entry.get("isDir") ? "directory" : "file"))
                });
            }
        } else {
            delete this.tabs.activity;
        }

        this.render();
    },

    additionalContext: function() {
        return {
            entityId: this.getEntityId(),
            lastUpdatedStamp: t("hdfs.last_updated", { when : chorus.helpers.relativeTimestamp(this.resource && this.resource.get("lastUpdatedStamp"))})
        }
    },

    getEntityId: function() {
        if (this.resource) {
            if (this.resource.get("id")) {
                return this.resource.get("id");
            } else {
                return this.options.instanceId + "|" + (this.options.rootPath + "/" +this.resource.get("name"));
            }
        }
    },

    createExternalTable: function(e) {
        e && e.preventDefault();
        var csv = new chorus.models.CsvHdfs({
            instanceId: this.options.instanceId,
            toTable: this.resource.get("name"),
            path: this.options.rootPath+"/"+this.resource.get("name")
        });
        csv.fetch();

        csv.onLoaded(function(){
            var dialog = new chorus.dialogs.CreateExternalTableFromHdfs({csv: csv});
            dialog.launchModal();
        });
    }
});
