chorus.dialogs.TableImportCSV = chorus.dialogs.Base.extend({
    className: "table_import_csv",
    title: t("dataset.import.table.title"),

    setup: function() {
        this.csv = this.options.csv;
    },

    additionalContext: function() {
        var sandbox = chorus.page.workspace.sandbox();
        return {
            columns: this.csv.columnOrientedData(),
            directions: t("dataset.import.table.directions", {
                instanceName: sandbox.instance().get('name'),
                databaseName: sandbox.database().get('name'),
                schemaName: sandbox.schema().get('name'),
                tablename_input_field: "<input type='text' name='table_name' value='" + this.options.tablename + "'/>"
            })
        }
    }

});