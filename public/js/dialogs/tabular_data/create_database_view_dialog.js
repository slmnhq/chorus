chorus.dialogs.CreateDatabaseView = chorus.dialogs.Base.extend({
    className: "create_database_view_dialog",
    title: t("create_database_view.title"),

    events: {
        "click button.submit": "performValidation"
    },

    makeModel:function (options) {
        this.model = new chorus.models.DatabaseViewConverter({}, {from: this.options.pageModel});
    },

    additionalContext: function() {
        return {
            canonicalName: this.options.launchElement.data("workspace").sandbox().schema().canonicalName()
        };
    },

    performValidation: function() {
        this.clearErrors();
        var $name = this.$("#create_database_view_name");

        if ($name.val().match(chorus.ValidationRegexes.ChorusIdentifier64())) {
            this.$("button.submit").startLoading("actions.creating");
            this.model.set({objectName: $name.val()}, {silent: true});
            this.model.save();
            return true;
        } else {
            this.markInputAsInvalid($name, t("validation.chorus64"), true);
            return false;
        }
    }
});