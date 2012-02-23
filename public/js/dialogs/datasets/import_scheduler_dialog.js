chorus.dialogs.ImportScheduler = chorus.dialogs.Base.extend({
    className: "import_scheduler",
    title: t("import_now.title"),

    persistent: true,

    events : {
        "change input:radio" : "typeSelected",
        "change input:checkbox" : "onCheckboxChecked",
        "keyup input:text": "onInputFieldChanged",
        "paste input:text": "onInputFieldChanged",
        "click button.submit": "beginImport"
    },

    makeModel: function() {
        this.dataset = this.options.launchElement.data("dataset");
        this.model = new chorus.models.DatasetImport({datasetId: this.dataset.id, workspaceId: this.dataset.get("workspace").id});

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

    typeSelected: function() {
        var disableExisting = this.$(".new_table input:radio").prop("checked");

        var $tableName = this.$(".new_table input.name");
        $tableName.prop("disabled", !disableExisting);
        $tableName.closest("fieldset").toggleClass("disabled", !disableExisting);

        var $tableSelect = this.$(".existing_table select");
        $tableSelect.prop("disabled", disableExisting);
        $tableSelect.closest("fieldset").toggleClass("disabled", disableExisting);
    },

    additionalContext: function() {
        return {
            canonicalName: this.dataset.schema().canonicalName()
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
        this.model.save(this.getNewModelAttrs());
        this.$("button.submit").startLoading("import_now.importing");
    },

    getNewModelAttrs: function() {
        var updates = {};
        var $enabledFieldSet = this.$("fieldset").not(".disabled");
        _.each($enabledFieldSet.find("input:text, input[type=hidden]"), function (i) {
            var input = $(i);
            updates[input.attr("name")] = input.val().trim();
        });

        updates.useLimitRows = $enabledFieldSet.find(".limit input:checkbox").prop("checked");

        return updates;
    }
});