chorus.dialogs.NameChorusView = chorus.dialogs.Base.extend({
    className: "name_chorus_view",
    title: t("dataset.name_chorus_view.title"),

    persistent: true,

    events: {
        "keyup input[name=name]": "checkInput",
        "paste input[name=name]": "checkInput",
        "click button.submit": "createChorusView"
    },

    setup: function() {
        this.resource.bind("saved", this.chorusViewCreated, this);
    },

    createChorusView: function(e) {
        e.preventDefault();

        this.model.set({
            objectName: this.$("input[name=name]").val().trim()
        })

        this.$("button.submit").startLoading("actions.creating")
        this.resource.save();
    },

    chorusViewCreated: function() {
        $(document).trigger("close.facebox");
        chorus.router.navigate(this.model.showUrl(), true);
    },

    checkInput: function() {
        var hasText = this.$("input[name=name]").val().trim().length > 0;
        this.$("button.submit").attr("disabled", !hasText);
    }
});