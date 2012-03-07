chorus.views.HdfsEntrySidebar = chorus.views.Sidebar.extend({
    constructorName: "HdfsEntrySidebar",
    className: "hdfs_entry_sidebar",

    subviews: {
        '.activity_list': 'activityList',
        '.tab_control': 'tabControl'
    },

    events : {
        'click .external_table': 'createExternalTable'
    },

    setup: function() {
        chorus.PageEvents.subscribe("hdfs_entry:selected", this.setEntry, this);
        chorus.PageEvents.subscribe("memo:added:hdfs", this.refreshActivities, this);
        this.tabControl = new chorus.views.TabControl([ {name: 'activity', selector: ".activity_list"} ]);
    },

    refreshActivities: function() {
        this.activityList && this.activityList.collection.fetch();
    },

    postRender: function() {
        if (this.resource.get("isDir")) {
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
            entry.entityId = this.makeEncodedEntityId();

            if (this.activityList) {
                delete this.activityList;
            }

            if (!entry.get("isDir")) {
                var activities = entry.activities();
                activities.fetch();

                this.bindings.add(activities, "changed", this.render);
                this.bindings.add(activities, "reset", this.render);

                this.activityList = new chorus.views.ActivityList({
                    collection: activities,
                    additionalClass: "sidebar",
                    type: t("hdfs." + (entry.get("isDir") ? "directory" : "file"))
                });

                this.activityList.bind("content:changed", this.recalculateScrolling, this)
            }
        } else {
            delete this.activityList;
        }

        this.render();
    },

    additionalContext: function() {
        return {
            encodedEntityId: this.makeEncodedEntityId(),
            lastUpdatedStamp: t("hdfs.last_updated", { when : chorus.helpers.relativeTimestamp(this.resource.get("lastModified"))})
        }
    },

    makeEncodedEntityId: function() {
        if (this.resource) {
            if (this.resource.get("id")) {
                return encodeURIComponent(this.resource.get("id"));
            } else {
                return encodeURIComponent(this.options.instanceId + "|" + (this.options.rootPath + "/" +this.resource.get("name")));
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