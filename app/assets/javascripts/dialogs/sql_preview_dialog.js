chorus.dialogs.SqlPreview = chorus.dialogs.Base.extend({
    constructorName: "SqlPreview",

    templateName: "sql_preview",
    title: t("sql_preview.dialog.title"),

    events: {
        "click .preview" : "previewData",
        "click button.cancel": "cancelTask"
    },

    subviews: {
        ".results_console": "resultsConsole"
    },

    setup: function() {
        this.resultsConsole = new chorus.views.ResultsConsole({titleKey: "dataset.data_preview", enableExpander: true, enableClose: true, enableResize: false});

        chorus.PageEvents.subscribe("action:closePreview", this.hidePreviewData, this);
        this.modalClosedHandle = chorus.PageEvents.subscribe("modal:closed", this.cancelTask, this);
    },

    makeCodeMirrorOptions: function() {
        return opts = {
            readOnly: "nocursor",
            lineNumbers: true,
            mode: "text/x-sql",
            fixedGutter: true,
            theme: "default",
            lineWrapping: true
        };
    },

    postRender: function() {
        var textArea = this.$(".text_editor");
        textArea.addClass('hidden');
        _.defer(_.bind(function() {
            this.editor = CodeMirror.fromTextArea(textArea[0], this.makeCodeMirrorOptions());
            this.editor.refresh();
            this.setupScrolling(this.$(".container"));
        }, this));
        this.hidePreviewData();
    },

    hidePreviewData: function() {
        this.$(".results_console").addClass("hidden");
        this.$("button.preview").removeClass("hidden")
    },

    previewData: function(e) {
        e && e.preventDefault();
        this.$(".results_console").removeClass("hidden");
        this.$("button.preview").addClass("hidden");
        var preview = this.model.preview().set({ query: this.sql() }, {silent: true});
        this.resultsConsole.execute(preview);
    },

    sql: function() {
        return this.model.get("query");
    },

    cancelTask: function() {
        this.resultsConsole.cancelExecution();
        chorus.PageEvents.unsubscribe(this.modalClosedHandle);
    }
});
