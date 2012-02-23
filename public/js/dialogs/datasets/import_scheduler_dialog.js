chorus.dialogs.ImportScheduler = chorus.dialogs.Base.extend({
    className: "import_scheduler",
    title: t("import_now.title"),

    events : {
        "change input:radio" : "typeSelected"
    },

    makeModel: function() {
        this.model = this.options.launchElement.data("dataset");
    },

    typeSelected: function() {
        var disableExisting = this.$(".new_table input:radio").prop("checked");

        this.$(".new_table input").not("input:radio").prop("disabled", !disableExisting);
        this.$(".existing_table input").not("input:radio").prop("disabled", disableExisting);
        this.$(".existing_table select").prop("disabled", disableExisting);
    },

    additionalContext: function() {
        return {
            canonicalName: this.model.schema().canonicalName()
        }
    }
});