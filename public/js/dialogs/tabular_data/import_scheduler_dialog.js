chorus.dialogs.ImportScheduler = chorus.dialogs.Base.extend({
    className: "import_scheduler",
    useLoadingSection: true,
    persistent: true,

    subviews: {
        ".new_table .schedule": "scheduleViewNew",
        ".existing_table .schedule": "scheduleViewExisting"
    },

    events: {
        "change input:radio": "onDestinationChosen",
        "change input:checkbox": "onCheckboxClicked",
        "keyup input:text": "onInputFieldChanged",
        "paste input:text": "onInputFieldChanged",
        "click button.submit": "beginImport",
        "click button.cancel": "onClickCancel"
    },

    makeModel: function() {
        this.dataset = this.options.launchElement.data("dataset");

        this.model = this.dataset.getImport();
        this.model.fetchIfNotLoaded();
        this.requiredResources.push(this.model);

        var workspaceId = this.dataset.get("workspace").id;
        this.sandboxTables = new chorus.collections.DatasetSet([], {workspaceId: workspaceId, type: "SANDBOX_TABLE"});
        this.requiredResources.push(this.sandboxTables);
        this.sandboxTables.sortAsc("objectName");
        this.sandboxTables.fetchAll();

        this.bindings.add(this.model, "saved", this.importSaved);
        this.bindings.add(this.model, "saveFailed validationFailed", function() {
            this.$("button.submit").stopLoading();
        });
    },

    setup: function() {
        this.scheduleViewNew = new chorus.views.ImportSchedule();
        this.scheduleViewExisting = new chorus.views.ImportSchedule();
        var launchElement = this.options.launchElement;

        if (launchElement.hasClass("create_schedule")) {
            this.title = t("import.title_schedule");
            this.submitText = t("import.begin_schedule");
            this.showSchedule = true;
            this.activeScheduleView = this.scheduleViewNew;
        } else if (launchElement.hasClass("edit_schedule")) {
            this.title = t("import.title_edit_schedule");
            this.submitText = t("actions.save_changes");
            this.showSchedule = true;
            this.activeScheduleView = this.scheduleViewNew;
        } else {
            this.title = t("import.title");
            this.submitText = t("import.begin");
        }
    },

    postRender: function() {
        this.setFieldValues(this.model);
        _.defer(_.bind(function() {chorus.styleSelect(this.$("select.names"))}, this));

        if (this.options.launchElement.hasClass("create_schedule")) {
            this.$("input[name='schedule']").prop("checked", true);
            this.activeScheduleView.enable();
            this.$("input[name='schedule']").prop("disabled", true);
        }
    },

    setFieldValues: function(model) {
        this.$("input[type='radio']").prop("checked", false);
        var toTableExists = !!(this.sandboxTables.findWhere({id: model.get("destinationTable")}));
        if (toTableExists) {
            this.$("input[type='radio']#import_scheduler_existing_table").prop("checked", true).change();
            this.activeScheduleView = this.scheduleViewExisting;
            this.$("select[name='toTable']").val(model.get("toTable"));
        } else {
            this.activeScheduleView = this.scheduleViewNew;
            this.$(".new_table input.name").val(model.get("toTable"));
            this.$("input[type='radio']#import_scheduler_new_table").prop("checked", true).change();
        }

        if (this.model.get("scheduleInfo")) {
            if (this.model.get("scheduleInfo").jobName) {
                this.$("input[name='schedule']").prop("checked", true);
            } else {
                this.$("input[name='schedule']").prop("checked", false);
            }
        }
        this.scheduleViewExisting.setFieldValues(this.model);
        this.scheduleViewNew.setFieldValues(this.model);

        if (model.get("truncate")) {
            this.$(".truncate").prop("checked", true);
        } else {
            this.$(".truncate").prop("checked", false);
        }

        if (model.get("sampleCount") && model.get("sampleCount") != '0') {
            this.$("input[name='limit_num_rows']").prop("checked", true);
            this.$("input[name='sampleCount']").prop("disabled", false);
            this.$("input[name='sampleCount']").val(model.get("sampleCount"));
        }
    },

    resourcesLoaded: function() {
        this.sandboxTables.models = _.filter(this.sandboxTables.models, _.bind(function(table) {
            return _.include(["BASE_TABLE", "MASTER_TABLE"], table.get("objectType"));
        }, this));
    },

    onDestinationChosen: function() {
        this.clearErrors();
        var disableExisting = this.$(".new_table input:radio").prop("checked");

        var $tableName = this.$(".new_table input.name");
        $tableName.prop("disabled", !disableExisting);
        $tableName.closest("fieldset").toggleClass("disabled", !disableExisting);

        var $tableSelect = this.$(".existing_table select.names");
        $tableSelect.prop("disabled", disableExisting);
        $tableSelect.closest("fieldset").toggleClass("disabled", disableExisting);

        this.activeScheduleView = disableExisting ? this.scheduleViewNew : this.scheduleViewExisting;
        if (this.options.launchElement.hasClass("create_schedule")) {
            this.activeScheduleView.enable();
        }

        chorus.styleSelect(this.$("select.names"));
        this.onInputFieldChanged();
    },

    additionalContext: function() {
        return {
            allowNewTruncate: !this.options.launchElement.hasClass("import_now"),
            sandboxTables: this.sandboxTables.pluck("objectName"),
            canonicalName: this.dataset.schema().canonicalName(),
            showSchedule: this.showSchedule,
            hideScheduleCheckbox: !this.model.hasActiveSchedule(),
            submitText: this.submitText
        }
    },

    onInputFieldChanged: function() {
        this.showErrors(this.model);
    },

    onCheckboxClicked: function(e) {
        var $fieldSet = this.$("fieldset").not(".disabled");
        var enabled = $fieldSet.find("input[name=limit_num_rows]").prop("checked");
        var $limitInput = $fieldSet.find(".limit input:text");
        $limitInput.prop("disabled", !enabled);

        if ($(e.target).is("input[name='schedule']")) {
            $(e.target).prop("checked") ? this.activeScheduleView.enable() : this.activeScheduleView.disable();
        }

        this.onInputFieldChanged();
    },

    oneTimeImport: function() {
        return !this.showSchedule;
    },

    beginImport: function() {
        if (this.oneTimeImport()) {
            this.$("button.submit").startLoading("import.importing");
        } else {
            this.$("button.submit").startLoading("actions.saving");
        }

        saveOptions = {};
        if (this.options.launchElement.hasClass("import_now")) {
            saveOptions.method = "create";
        }

        this.model.save(this.getNewModelAttrs(), saveOptions);
    },

    importSaved: function() {
        if (this.oneTimeImport()) {
            chorus.toast("import.success");
        } else {
            chorus.toast("import.schedule.toast");
        }
        chorus.PageEvents.broadcast('importSchedule:changed', this.model);
        this.dataset.trigger('change');
        this.closeModal();
    },

    getNewModelAttrs: function() {
        var updates = {};
        var $enabledFieldSet = this.$("fieldset").not(".disabled");
        _.each($enabledFieldSet.find("input:text, input[type=hidden], select"), function(i) {
            var input = $(i);
            if (input.is(":enabled") && input.closest(".schedule_widget").length == 0) {
                updates[input.attr("name")] = input.val() && input.val().trim();
            }
        });

        var $truncateCheckbox = $enabledFieldSet.find(".truncate");
        if ($truncateCheckbox.length) {
            updates.truncate = $truncateCheckbox.prop("checked") + "";
        }

        updates.useLimitRows = $enabledFieldSet.find(".limit input:checkbox").prop("checked");
        if (!updates.useLimitRows) {
            updates.sampleCount = 0;
        }

        updates.activateSchedule = !!($enabledFieldSet.find("input:checkbox[name='schedule']").prop("checked"));
        if (updates.activateSchedule) {
            _.extend(updates, this.activeScheduleView.fieldValues());
        }

        updates.importType = this.oneTimeImport() ? "oneTime" : "schedule";

        return updates;
    },

    onClickCancel: function() {
        this.model.clearErrors();
        this.closeModal();
    }
});
