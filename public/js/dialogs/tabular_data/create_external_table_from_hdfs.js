chorus.dialogs.CreateExternalTableFromHdfs = chorus.dialogs.NewTableImportCSV.extend({
    title: t("hdfs.create_external.title"),
    ok: t("hdfs.create_external.ok"),
    useLoadingSection: true,
    loadingKey: "hdfs.create_external.creating",

    setup: function() {
        this._super("setup", arguments);

        this.workspaces = new chorus.collections.WorkspaceSet([], {userId: chorus.session.user().id});
        this.workspaces.fetchAll();
        this.requiredResources.push(this.workspaces);
        this.csv.set({toTable : chorus.models.CSVImport.normalizeForDatabase(this.csv.get("toTable"))});
    },

    postRender: function() {
        this._super("postRender", arguments)

        if (this.workspaces.loaded) {
            if (!this.workspaces.length) {
                this.workspaces.serverErrors = [
                    {message: t("hdfs.create_external.no_workspaces")}
                ];
                this.showErrors(this.workspaces);
            }

            chorus.styleSelect(this.$("select"));
        }
    },

    saved: function() {
        this.closeModal();
        chorus.toast("hdfs.create_external.success", {workspaceName: this.workspaceName, tableName: this.csv.get("toTable")});
        chorus.PageEvents.broadcast("csv_import:started");
    },

    prepareCsv: function() {
        var $names = this.$(".column_names input:text");
        var $types = this.$(".data_types .chosen");
        var toTable = this.$(".directions input:text").val();
        var columns = _.map($names, function(name, i) {
            var $name = $names.eq(i);
            var $type = $types.eq(i);
            return chorus.Mixins.dbHelpers.safePGName($name.val())+" "+$type.text();
        })
        var statement = toTable + " (" + columns.join(", ") + ")";

        this.workspaceName = this.$("option:selected").text();
        this.tableName = this.$(".directions input:text").val();

        this.csv.set({
            workspaceId: this.$("option:selected").val(),
            statement: statement,
            toTable: chorus.models.CSVImport.normalizeForDatabase(this.$(".directions input:text").val())
        });
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
        parentCtx.directions = new Handlebars.SafeString("<input type='text' class='hdfs' name='table_name' value='" + Handlebars.Utils.escapeExpression(this.csv.get("toTable")) + "'/>");
        return parentCtx;
    }
});