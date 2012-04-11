chorus.dialogs.NameChorusView = chorus.dialogs.SqlPreview.extend({
    className: "name_chorus_view",
    title: t("dataset.name_chorus_view.title"),
    additionalClass: "sql_preview",

    persistent: true,

    setup: function() {
        this._super("setup");

        this.bindings.add(this.model, "saved", this.chorusViewCreated);
        this.bindings.add(this.model, "saveFailed", this.chorusViewFailed);
        this.bindings.add(this.model, "validationFailed", this.chorusViewFailed);

        this.events = _.clone(this.events);
        _.extend(this.events, {
            "keyup input[name=objectName]": "checkInput",
            "paste input[name=objectName]": "checkInput",
            "submit form": "createChorusView"
        });
    },

    createChorusView: function(e) {
        e.preventDefault();

        this.model.set({
            query: this.sql(),
            objectName: this.$("input[name=objectName]").val().trim()
        })

        this.$("button.submit").startLoading("actions.creating")
        this.model.save();
    },

    sql: function() {
        return this.editor.getValue();
    },

    chorusViewCreated: function() {
        $(document).trigger("close.facebox");
        chorus.router.navigate(this.model.showUrl());
    },

    chorusViewFailed: function() {
        this.$("button.submit").stopLoading()
    },

    checkInput: function() {
        var hasText = this.$("input[name=objectName]").val().trim().length > 0;
        this.$("button.submit").prop("disabled", !hasText);
    },

    makeCodeMirrorOptions: function() {
        var options = this._super("makeCodeMirrorOptions");
        delete options.readOnly;
        return options;
    }
});
