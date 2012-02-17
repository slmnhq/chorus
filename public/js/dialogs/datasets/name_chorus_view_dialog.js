chorus.dialogs.NameChorusView = chorus.dialogs.Base.extend({
    className: "name_chorus_view",
    title: t("dataset.name_chorus_view.title"),

    persistent: true,

    events: {
        "keyup input[name=objectName]": "checkInput",
        "paste input[name=objectName]": "checkInput",
        "submit form": "createChorusView"
    },

    setup: function() {
        this.model.bind("saved", this.chorusViewCreated, this);
        this.model.bind("saveFailed", this.chorusViewFailed, this);
        this.model.bind("validationFailed", this.chorusViewFailed, this);
    },

    createChorusView: function(e) {
        e.preventDefault();

        this.model.set({
            objectName: this.$("input[name=objectName]").val().trim()
        })

        this.$("button.submit").startLoading("actions.creating")
        this.model.save();
    },

    chorusViewCreated: function() {
        $(document).trigger("close.facebox");
        chorus.router.navigate(this.model.showUrl(), true);
    },

    chorusViewFailed: function() {
        this.$("button.submit").stopLoading()
    },

    checkInput: function() {
        var hasText = this.$("input[name=objectName]").val().trim().length > 0;
        this.$("button.submit").attr("disabled", !hasText);
    }
});