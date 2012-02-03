chorus.dialogs.BrowseDatasets = chorus.dialogs.Base.extend({
    className: 'browse_datasets',
    title: t("browse_datasets_dialog.title"),

    events: {
        "click button.submit": "clickShowDatasets"
    },

    subviews: {
        '.schema_picker': 'schemaPicker'
    },

    setup: function () {
        this.schemaPicker = new chorus.views.SchemaPicker({instance: this.pageModel});
    },

    clickShowDatasets: function() {
        if(_.all(this.schemaPicker.fieldValues(), _.identity)) {
            this.navigate();
        }
    },

    navigate: function () {

    }
});