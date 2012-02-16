chorus.dialogs.TableImportCSV = chorus.dialogs.Base.extend({
    className: "table_import_csv",
    title: t("dataset.import.table.title"),

    setup: function() {
        this.csv = this.options.csv;
    },

    additionalContext: function() {
        return {
            columns: this.csv.columnOrientedData()
        }
    }

});