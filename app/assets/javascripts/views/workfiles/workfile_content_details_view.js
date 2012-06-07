chorus.views.WorkfileContentDetails = chorus.views.Base.extend({
    templateName:"workfile_content_details",
    additionalClass: "workfile_content_details",

    setup: function() {
        chorus.PageEvents.subscribe("file:autosaved", this.updateAutosaveText, this);
        chorus.PageEvents.subscribe("file:selectionEmpty", this.showSaveFileMenu, this);
        chorus.PageEvents.subscribe("file:selectionPresent", this.showSaveSelectionMenu, this);
    },

    updateAutosaveText: function(args) {
        var text = args ? args : "workfile.content_details.auto_save";

        var time = this.formatTime(new Date());
        this.$("span.auto_save").removeClass("hidden");
        this.$("span.auto_save").text(t(text, {time:time}))
    },

    selectionMenuItems: function() {
        return [{
                name: "new",
                text: t("workfile.content_details.save_selection_new_version"),
                onSelect: _.bind(this.createNewVersionFromSelection, this)
            },
            {
                name: "replace",
                text: t("workfile.content_details.replace_current_with_selection"),
                onSelect: _.bind(this.replaceCurrentVersionWithSelection, this)
            }
        ];
    },

    fileMenuItems: function() {
        return [{
                name: "new",
                text: t("workfile.content_details.save_new_version"),
                onSelect: _.bind(this.createNewVersion, this)
            },
            {
                name: "replace",
                text: t("workfile.content_details.replace_current"),
                onSelect: _.bind(this.replaceCurrentVersion, this)
            }
        ];
    },

    postRender: function() {
        this.fileMenu = new chorus.views.Menu({
            launchElement: this.$(".save_file_as"),
            checkable: false,
            orientation: "left",
            items: this.fileMenuItems()
        });

        this.selectionMenu = new chorus.views.Menu({
            launchElement: this.$(".save_selection_as"),
            checkable: false,
            orientation: "left",
            items: this.selectionMenuItems()
        });

        if (!this.model.isLatestVersion()) {
            this.fileMenu.disableItem("replace");
            this.selectionMenu.disableItem("replace");
        }

        if (!this.model.workspace().isActive()) {
            this.$(".save_file_as, .save_selection_as").attr("disabled", true);
        }
    },

    replaceCurrentVersion: function() {
        this.updateAutosaveText("workfile.content_details.save");
        chorus.PageEvents.broadcast("file:replaceCurrentVersion");
    },

    replaceCurrentVersionWithSelection: function() {
        this.updateAutosaveText("workfile.content_details.save");
        chorus.PageEvents.broadcast("file:replaceCurrentVersionWithSelection");
    },

    createNewVersion: function() {
        chorus.PageEvents.broadcast("file:createNewVersion");
    },

    createNewVersionFromSelection: function() {
        chorus.PageEvents.broadcast("file:createNewVersionFromSelection");
    },

    showSaveFileMenu: function() {
        this.$('.save_file_as').removeClass('hidden');
        this.$('.save_selection_as').addClass('hidden');
    },

    showSaveSelectionMenu: function() {
        this.$('.save_file_as').addClass('hidden');
        this.$('.save_selection_as').removeClass('hidden');
    },

    formatTime: function(time) {
        var hours = time.getHours();
        var minutes = time.getMinutes();

        var suffix = "AM";
        if (hours >= 12) {
            suffix = "PM";
            hours = hours - 12;
        }
        if (hours == 0) {
            hours = 12;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        return hours + ":" + minutes + " " + suffix;
    }
},
{
    buildFor: function(model, contentView) {
        if (model.isImage()) {
            return new chorus.views.ImageWorkfileContentDetails({ model:model });
        }

        if (model.isSql()) {
            if (model.workspace().isActive()) {
                return new chorus.views.SqlWorkfileContentDetails({ model:model, contentView: contentView });
            } else {
                return new chorus.views.ArchivedWorkfileContentDetails({ model:model });
            }
        }

        if (model.isAlpine()) {
            return new chorus.views.AlpineWorkfileContentDetails({ model:model });
        }

        if (model.isBinary()) {
            return new chorus.views.BinaryWorkfileContentDetails({ model:model });
        }

        return new chorus.views.WorkfileContentDetails({ model:model });
    }
});
