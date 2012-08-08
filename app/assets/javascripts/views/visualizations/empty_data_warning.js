chorus.views.visualizations.EmptyDataWarning = chorus.views.Base.extend({
    templateName: "empty_data_warning",

    additionalContext: function() {
        return { message: this.options.message }
    }
});