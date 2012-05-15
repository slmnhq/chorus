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
        this.$("input#" + this.pathType).prop("checked", true);
    },

    additionalContext: function() {
        var parentCtx = this._super("additionalContext", arguments);
        parentCtx.expression = this.pattern;
        parentCtx.directions = new Handlebars.SafeString("<input type='text' class='hdfs' name='toTable' value='" + Handlebars.Utils.escapeExpression(this.csv.get("toTable")) + "'/>");
        parentCtx.hasHeader = this.csv.get("hasHeader");
        return parentCtx;
    },

    performValidation: function() {
        var parent_dialog_valid = this._super("performValidation", arguments);

        if(this.$("input[name='pathType']:checked").val() == "pattern") {
            var regexp_s = this.$("input[name='expression']").val();

            regexp_s = regexp_s.replace(/\*/g, ".*");
            var regexp = new RegExp(regexp_s, "i");
            var result = regexp.test(this.csv.get("name"));

            if (!result) {
                this.markInputAsInvalid(this.$("input[name='expression']"), t("hdfs_instance.create_external.validation.expression"), true);
            }
            return result && parent_dialog_valid;
        }

        return parent_dialog_valid;
    },

    saved: function() {
        this.closeModal();
        chorus.toast("hdfs.create_external.success", {tableName: this.csv.get("toTable")});
        chorus.PageEvents.broadcast("csv_import:started");
    },

    prepareCsv: function() {
        var $names = this.$(".column_names input:text");
        var $types = this.$(".data_types .chosen");
        var toTable = this.$(".directions input:text").val();
        var columns = _.map($names, function(name, i) {
            var $name = $names.eq(i);
            var $type = $types.eq(i);
            return chorus.Mixins.dbHelpers.safePGName($name.val()) + " " + $type.text();
        })

        var statement = toTable + " (" + columns.join(", ") + ")";


        this.tableName = this.$(".directions input:text").val();

        var pathType = this.$("input[name='pathType']:checked").val();
        var path = (pathType === "pattern") ? this.collection.attributes.path + "/" + this.$("input[name='expression']").val() : this.csv.get("path");

        this.csv.set({
            fileType: "TEXT",
            pathType : pathType,
            workspaceId: this.options.workspaceId,
            statement: statement,
            toTable: chorus.models.CSVImport.normalizeForDatabase(toTable),
            path: path
        }, {silent : true});
    },

    fetchSample: function(e) {
        e && e.preventDefault();
        this.pathType = this.$("input[name='pathType']:checked").val();
        this.pattern = this.$("input[name='expression']").val();
        this.csv = this.collection.find(function(csvSet) {
            return csvSet.get('name') == $(e.target).val()
        });

        this.setupCsv();

        this.bindings.add(this.csv, "saved", this.saved);
        this.bindings.add(this.csv, "saveFailed", this.saveFailed);
        this.bindings.add(this.csv, "validationFailed", this.saveFailed);

        this.csv.fetch();
        this.csv.set({hasHeader: !!(this.$("#hasHeader").prop("checked"))}, {silent: true});

        this.$(".data_table").startLoading();
        this.csv.onLoaded(function() {
            this.$(".data_table").stopLoading();
            this.render();
        }, this)
    }
});