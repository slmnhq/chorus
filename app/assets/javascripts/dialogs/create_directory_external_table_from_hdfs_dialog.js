chorus.dialogs.CreateDirectoryExternalTableFromHdfs = chorus.dialogs.NewTableImportCSV.extend({
    constructorName: "CreateDirectoryExternalTableFromHdfs",
    title: t("hdfs.create_external.title"),
    ok: t("hdfs.create_external.ok"),
    loadingKey: "hdfs.create_external.creating",
    templateName: "create_directory_external_table_from_hdfs",

    setup: function() {
        this.csv = this.options.csv = this.collection && this.collection.at(0);
        this.setupCsv();
        this._super("setup", arguments);
    },

    events: {
        "change select" : "fetchSample"
    },

    setupCsv: function(){
        this.csv.set({toTable: chorus.models.CSVImport.normalizeForDatabase(this.options.directoryName)});
        this.csv.set({instanceId : this.csv.get("instance").id}, {silent: true});

        var path = this.collection.attributes.path;
        var separator = (path == "/") ? "" : "/";

        this.csv.set({path: path + separator + this.csv.get("name")}, {silent: true});
    },

    postRender: function() {
        this._super("postRender", arguments);
        this.$("select").val(this.csv.get("name"));
    },

    additionalContext: function() {
        var parentCtx = this._super("additionalContext", arguments);
        parentCtx.directions = new Handlebars.SafeString("<input type='text' class='hdfs' name='toTable' value='" + Handlebars.Utils.escapeExpression(this.csv.get("toTable")) + "'/>");
        return parentCtx;
    },

    fetchSample: function(e) {
        e && e.preventDefault();
        this.csv = this.collection.find(function(csvSet) {
            return csvSet.get('name') == $(e.target).val()
        });
        this.setupCsv();
        this.csv.fetch();

        this.$(".data_table").startLoading();
        this.csv.onLoaded(function() {
            this.$(".data_table").stopLoading();
            this.render(); }, this)
    }
});