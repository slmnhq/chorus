chorus.dialogs.ImportScheduler = chorus.dialogs.Base.extend({
    className: "import_scheduler",
    title: t("import_now.title"),

    events : {
        "change input:radio" : "typeSelected",
        "change input:checkbox" : "onCheckboxChecked",
        "keyup input:text": "onInputFieldChanged",
        "paste input:text": "onInputFieldChanged",
        "click button.submit": "beginImport"
    },

    makeModel: function() {
        this.dataset = this.options.launchElement.data("dataset");
        this.model = new chorus.models.DatasetImport();

        this.model.bind("saved", function() {
            chorus.toast("import_now.success")
        });
    },

    postRender: function() {
        _.defer(_.bind(function(){chorus.styleSelect(this.$("select"))}, this));
    },

    typeSelected: function() {
        var disableExisting = this.$(".new_table input:radio").prop("checked");
        this.$(".new_table input.name").prop("disabled", !disableExisting).closest("fieldset").toggleClass("disabled", !disableExisting);
        this.$(".existing_table select").prop("disabled", disableExisting).closest("fieldset").toggleClass("disabled", disableExisting);

        this.$("input[name=limit_num_rows]").prop("checked", false).change();
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
        var enabled = this.$("input[name=limit_num_rows]").prop("checked");
        var $limitInput = this.$(".limit input:text");
        $limitInput.prop("disabled", !enabled);

        if (!enabled) {
            $limitInput.val('');
        }
    },

    beginImport: function() {
        this.model.save(this.getNewModelAttrs());
        this.$("button.submit").startLoading("import_now.importing");
    },

    getNewModelAttrs: function() {
        var updates = {};
        _.each(this.$("input:text"), function (i) {
            var input = $(i);
            updates[input.attr("name")] = input.val().trim();
        });

        return updates;
    }
});