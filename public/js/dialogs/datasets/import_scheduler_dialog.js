chorus.dialogs.ImportScheduler = chorus.dialogs.Base.extend({
    className: "import_scheduler",
    useLoadingSection: true,
    persistent: true,

    events : {
        "change input:radio" : "onDestinationChosen",
        "change input:checkbox": "onCheckboxChecked",
        "keyup input:text": "onInputFieldChanged",
        "paste input:text": "onInputFieldChanged",
        "click button.submit": "beginImport"
    },

    setup: function() {
        if (this.options.launchElement.data("use-schedule")) {
            this.title = t("import_now.title_schedule");
            this.submitText = t("import_now.begin_schedule")

        } else {
            this.title = t("import_now.title");
            this.submitText = t("import_now.begin");
        }
    },

    makeModel: function() {
        this.dataset = this.options.launchElement.data("dataset");
        var workspaceId = this.dataset.get("workspace").id;
        this.model = new chorus.models.DatasetImport({datasetId: this.dataset.id, workspaceId: workspaceId});

        this.sandboxTables = new chorus.collections.DatasetSet([], {workspaceId: workspaceId, type: "SANDBOX_TABLE"});
        this.requiredResources.push(this.sandboxTables);
        this.sandboxTables.sortAsc("objectName");
        this.sandboxTables.fetchAll();

        this.model.bind("saved", function() {
            chorus.toast("import_now.success");
            this.closeModal();
        }, this);

        this.model.bind("saveFailed", function() {
            this.$("button.submit").stopLoading();
        }, this);
    },

    postRender: function() {
        _.defer(_.bind(function(){chorus.styleSelect(this.$("select"))}, this));
    },

    onDestinationChosen: function() {
        var disableExisting = this.$(".new_table input:radio").prop("checked");

        var $tableName = this.$(".new_table input.name");
        $tableName.prop("disabled", !disableExisting);
        $tableName.closest("fieldset").toggleClass("disabled", !disableExisting);

        var $tableSelect = this.$(".existing_table select");
        $tableSelect.prop("disabled", disableExisting);
        $tableSelect.closest("fieldset").toggleClass("disabled", disableExisting);

        chorus.styleSelect($tableSelect);
        this.onInputFieldChanged();
    },

    additionalContext: function() {
        return {
            sandboxTables: this.sandboxTables.pluck("objectName"),
            canonicalName: this.dataset.schema().canonicalName(),
            submitText: this.submitText
        }
    },

    onInputFieldChanged: function() {
        this.model.performValidation(this.getNewModelAttrs());
        this.$("button.submit").prop("disabled", !this.model.isValid());
    },

    onCheckboxChecked: function() {
        var $fieldSet = this.$("fieldset").not(".disabled");
        var enabled = $fieldSet.find("input[name=limit_num_rows]").prop("checked");
        var $limitInput = $fieldSet.find(".limit input:text");
        $limitInput.prop("disabled", !enabled);

        this.onInputFieldChanged();
    },

    beginImport: function() {
        this.$("button.submit").startLoading("import_now.importing");
        this.model.save(this.getNewModelAttrs());
    },

    getNewModelAttrs: function() {
        var updates = {};
        var $enabledFieldSet = this.$("fieldset").not(".disabled");
        _.each($enabledFieldSet.find("input:text, input[type=hidden], select"), function (i) {
            var input = $(i);
            updates[input.attr("name")] = input.val().trim();
        });

        var $truncateCheckbox = $enabledFieldSet.find(".truncate");
        if ($truncateCheckbox.length) {
            updates.truncate = $truncateCheckbox.prop("checked") + "";
        }

        updates.useLimitRows = $enabledFieldSet.find(".limit input:checkbox").prop("checked");

        return updates;
    }
});