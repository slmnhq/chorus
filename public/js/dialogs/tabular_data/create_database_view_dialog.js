chorus.dialogs.CreateDatabaseView = chorus.dialogs.Base.extend({
    className: "create_database_view_dialog",
    title: t("create_database_view.title"),

    events: {
        "click button.submit": "performValidation"
    },

    makeModel:function (options) {
        this.dataset = this.options.pageModel;
        this.model = new chorus.models.DatabaseViewConverter({}, {from: this.dataset});
        this.bindings.add(this.model, "saved", this.saved);
        this.bindings.add(this.model, "saveFailed", this.saveFailed);
    },

    additionalContext: function() {
        return {
            canonicalName: this.canonicalName()
        };
    },

    performValidation: function() {
        this.clearErrors();
        var $name = this.$("#create_database_view_name");

        if ($name.val().match(chorus.ValidationRegexes.ChorusIdentifierLower64())) {
            this.$("button.submit").startLoading("actions.creating");
            this.model.set({objectName: $name.val()}, {silent: true});
            this.model.save();
        } else {
            this.markInputAsInvalid($name, t("validation.chorus64"), true);
        }
    },

    saved: function() {
        chorus.toast("create_database_view.toast_success", {
            canonicalName: this.canonicalName(),
            viewName: this.model.get("objectName")
        })
        this.closeModal();
    },

    saveFailed: function() {
        this.$("button.submit").stopLoading();
    },

    canonicalName: function() {
        return this.dataset.schema().canonicalName()
    }
});