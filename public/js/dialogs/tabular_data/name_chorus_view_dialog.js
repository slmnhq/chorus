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

        _.extend(this.events, {
            "keyup input[name=objectName]": "checkInput",
            "paste input[name=objectName]": "checkInput",
            "submit form": "createChorusView"
        });
    },

    postRender: function() {
        var opts = {
            lineNumbers: true,
            mode: "text/x-sql",
            fixedGutter: true,
            theme: "default",
            lineWrapping: true
        };

        _.defer(_.bind(function() {
            var textArea = this.$("textarea.sql_preview")[0];
            if (textArea !== this.textArea) {
                this.textArea = textArea;
                this.editor = CodeMirror.fromTextArea(this.textArea, opts);

                var ed = this.editor;
                _.defer(function() {
                    ed.refresh();
                    ed.refresh();
                    ed.refresh();
                });

                this.setupScrolling(this.$(".container"));
            }
        }, this));
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

    chorusViewCreated: function() {
        $(document).trigger("close.facebox");
        chorus.router.navigate(this.model.showUrl(), true);
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
    },

    sql: function() {
        return (this.editor ? this.editor.getValue() : this._super("sql"));
    }
});
