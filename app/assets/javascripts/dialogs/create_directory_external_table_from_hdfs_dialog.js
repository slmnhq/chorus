chorus.dialogs.CreateDirectoryExternalTableFromHdfs = chorus.dialogs.NewTableImportCSV.extend({
    constructorName: "CreateDirectoryExternalTableFromHdfs",
    title: t("hdfs.create_external.title"),
    ok: t("hdfs.create_external.ok"),
    loadingKey: "hdfs.create_external.creating",
    templateName: "create_directory_external_table_from_hdfs",

    setup: function() {
        this.options.csv = this.collection && this.collection.at(0);
        this.options.csv.set({toTable: chorus.models.CSVImport.normalizeForDatabase(this.options.directoryName)});
        this._super("setup", arguments);
    },

    additionalContext: function() {
        var parentCtx = this._super("additionalContext", arguments);
        parentCtx.directions = new Handlebars.SafeString("<input type='text' class='hdfs' name='toTable' value='" + Handlebars.Utils.escapeExpression(this.csv.get("toTable")) + "'/>");
        return parentCtx;
    }
});