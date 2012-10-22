chorus.dialogs.CreateDirectoryExternalTableFromHdfs = chorus.dialogs.NewTableImportCSV.extend({
    constructorName: "CreateDirectoryExternalTableFromHdfs",
    title: t("hdfs.create_external.title"),
    ok: t("hdfs.create_external.ok"),
    loadingKey: "hdfs.create_external.creating",
    templateName: "create_directory_external_table_from_hdfs",
    includeHeader: false,

    events: {
        "change select" : "fetchSample"
    },

    setup: function() {
        this.options.model = this.collection && this.collection.at(0);
        this.options.csvOptions = this.options.csvOptions || {};

        this.model = this.options.model;
        this.csvOptions = this.options.csvOptions;

        this.setupCsvOptions();
        this.setupModel();

        $(document).one('reveal.facebox', _.bind(this.setupSelects, this));

        this._super("setup", arguments);
    },

    setupCsvOptions: function(){
        this.csvOptions.hasHeader = false;
        this.csvOptions.tableName = chorus.utilities.CsvParser.normalizeForDatabase(this.options.directoryName);
    },

    setupModel: function() {
        this.model.set({hadoopInstanceId : this.collection.attributes.hadoopInstance.id}, {silent: true});
        this.model.set({path: this.pathWithSlash() + this.model.get("name")}, {silent: true});
    },

    setupSelects: function() {
        chorus.styleSelect(this.$("select"));
    },

    postRender: function() {
        this._super("postRender", arguments);
        this.$("select").val(this.model.get("name"));
        this.$("input#" + this.pathType).prop("checked", true);
    },

    additionalContext: function() {
        var parentCtx = this._super("additionalContext", arguments);
        parentCtx.expression = this.pattern;
        parentCtx.directions = new Handlebars.SafeString("<input type='text' class='hdfs' name='tableName' value='" + Handlebars.Utils.escapeExpression(this.model.get('tableName')) + "'/>");
        return parentCtx;
    },

    pathWithSlash: function() {
        var path = this.collection.attributes.path;
        return (path == "/") ? path : path + "/";
    },

    performValidation: function() {
        var parent_dialog_valid = this._super("performValidation", arguments);

        if(this.$("input[name='pathType']:checked").val() == "pattern") {
            var regexp_s = this.$("input[name='expression']").val();

            regexp_s = regexp_s.replace(/\*/g, ".*");
            var regexp = new RegExp(regexp_s, "i");
            var result = regexp.test(this.model.get("name"));

            if (!result) {
                this.markInputAsInvalid(this.$("input[name='expression']"), t("hdfs_instance.create_external.validation.expression"), true);
            }
            return result && parent_dialog_valid;
        }

        return parent_dialog_valid;
    },

    saved: function() {
        this.closeModal();
        chorus.toast("hdfs.create_external.success", {tableName: this.model.get('tableName'), workspaceName: this.model.get("workspaceName")});
        chorus.PageEvents.broadcast("csv_import:started");
    },

    saveFailed: function() {
        this.showErrors();
        this.$("button.submit").stopLoading();
    },

    updateModel: function() {
        var $names = this.$(".column_names input:text");
        var $types = this.$(".data_types .chosen");
        var tableName = this.$(".directions input:text").val();
        var columns = _.map($names, function(name, i) {
            var $name = $names.eq(i);
            var $type = $types.eq(i);
            return chorus.Mixins.dbHelpers.safePGName($name.val()) + " " + $type.text();
        })

        var statement = tableName + " (" + columns.join(", ") + ")";


        this.tableName = this.$(".directions input:text").val();

        var pathType = this.$("input[name='pathType']:checked").val();
        var path = (pathType === "pattern") ? this.pathWithSlash() + this.$("input[name='expression']").val() : this.collection.attributes.path;

        this.model.set({
            fileType: "TEXT",
            pathType : pathType,
            workspaceId: this.options.workspaceId,
            workspaceName: this.options.workspaceName,
            statement: statement,
            tableName: chorus.utilities.CsvParser.normalizeForDatabase(tableName),
            path: path,
            delimiter: this.delimiter
        }, {silent : true});
    },

    fetchSample: function(e) {
        e && e.preventDefault();
        this.pathType = this.$("input[name='pathType']:checked").val();
        this.pattern = this.$("input[name='expression']").val();
        this.resource = this.model = this.collection.find(function(modelSet) {
            return modelSet.get('name') == $(e.target).val()
        });

        this.setupCsvOptions();
        this.setupModel();

        this.bindings.add(this.model, "saved", this.saved);
        this.bindings.add(this.model, "saveFailed", this.saveFailed);
        this.bindings.add(this.model, "validationFailed", this.saveFailed);

        this.model.fetch();
        this.model.set({hasHeader: !!(this.$("#hasHeader").prop("checked"))}, {silent: true});

        this.$(".data_table").startLoading();

        this.bindings.add(this.model, "loaded", function() {
            this.$(".data_table").stopLoading();
            this.render();
            this.setupSelects();
        });
    }
});
