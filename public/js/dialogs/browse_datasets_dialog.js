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
        var instanceJson = this.options.launchElement.data("instance");
        var databaseName = this.options.launchElement.data("databaseName");
        if (instanceJson) {
            if (databaseName) {
                this.schemaPicker = new chorus.views.SchemaPicker({instance: new chorus.models.Instance(instanceJson), database: new chorus.models.Database({name: databaseName, instanceId: instanceJson.id})});
            } else {
                this.schemaPicker = new chorus.views.SchemaPicker({instance: new chorus.models.Instance(instanceJson)});
            }
        } else {
            this.schemaPicker = new chorus.views.SchemaPicker({instance: this.pageModel});
        }
    },

    clickShowDatasets: function() {
        if(_.all(this.schemaPicker.fieldValues(), _.identity)) {
            this.navigate();
        }
    },

    navigate: function () {
        chorus.router.navigate(this.schemaPicker.selectedSchema.showUrl(), true);
    }
});