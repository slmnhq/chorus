chorus.dialogs.CreateExternalTableFromHdfs = chorus.dialogs.NewTableImportCSV.extend({
    constructorName: "CreateExternalTableFromHdfs",
    title: t("hdfs.create_external.title"),
    ok: t("hdfs.create_external.ok"),
    useLoadingSection: true,
    loadingKey: "hdfs.create_external.creating",
    includeHeader: false,

    events: {
        "change select": "selectWorkspace"
    },

    setup: function() {
        this.options.csvOptions = this.options.csvOptions || {};

        this.options.csvOptions.hasHeader = false;

        this._super("setup", arguments);

        this.workspaces = new chorus.collections.WorkspaceSet([], {userId: chorus.session.user().id});
        this.workspaces.fetchAll();
        this.requiredResources.push(this.workspaces);
        this.model.set({tableName: chorus.utilities.CsvParser.normalizeForDatabase(this.csvOptions.tableName)});
    },

    postRender: function() {
        this._super("postRender", arguments);

        if (this.workspaces.loaded) {
            if (!this.workspaces.length) {
                this.workspaces.serverErrors = { fields: { workspaces: { EMPTY: {} } } }
                this.showErrors(this.workspaces);
                this.$('button.submit').attr('disabled', true);
            }

            this.$("select").val(this.model.get("workspaceId"));

            chorus.styleSelect(this.$("select"));
        }
    },

    saved: function() {
        this.closeModal();
        chorus.toast("hdfs.create_external.success", {workspaceName: this.workspaceName, tableName: this.model.get("tableName")});
        chorus.PageEvents.broadcast("csv_import:started");
    },

    updateModel: function() {
        var $names = this.$(".column_names input:text");
        var $types = this.$(".data_types .chosen");
        var tableName = this.$(".directions input:text").val();
        var columnNames = _.map($names, function(name, i) {
            var $name = $names.eq(i);
            return chorus.Mixins.dbHelpers.safePGName($name.val());
        });

        this.workspaceName = this.$("option:selected").text();
        this.tableName = this.$(".directions input:text").val();

        //this._super("updateModel", arguments);

        this.model.set({
            workspaceId: this.$("option:selected").val(),
            delimiter: this.delimiter,
            tableName: chorus.utilities.CsvParser.normalizeForDatabase(this.$(".directions input:text").val()),
            columnNames: columnNames
        });
    },

    selectWorkspace: function() {
        this.model.set({workspaceId: this.$("option:selected").val()});
    },

    resourcesLoaded: function() {
        var withSandboxes = this.workspaces.filter(function(ws) {
            return !!ws.sandbox();
        });

        this.workspaces.reset(withSandboxes, {silent: true});
    },

    additionalContext: function() {
        var parentCtx = this._super("additionalContext", arguments);
        parentCtx.workspaces = _.pluck(this.workspaces.models, "attributes");
        parentCtx.directions = new Handlebars.SafeString("<input type='text' class='hdfs' name='tableName' value='" + Handlebars.Utils.escapeExpression(this.model.get("tableName")) + "'/>");
        return parentCtx;
    }
});
