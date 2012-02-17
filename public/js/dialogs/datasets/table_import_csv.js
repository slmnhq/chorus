chorus.dialogs.TableImportCSV = chorus.dialogs.Base.extend({
    className: "table_import_csv",
    title: t("dataset.import.table.title"),

    setup: function() {
        this.csv = this.options.csv;
        this.columnOrientedData = this.csv.columnOrientedData();
        this.linkMenus = _.map(this.columnOrientedData, function(item) {
            return new chorus.views.LinkMenu({
                options: [
                    {data: "text", text: "text"},
                    {data: "float", text: "float"}
                ],
                title: '',
                event: "setType",
                chosen: item.type
            });
        })
        this.tableName = chorus.models.CSVImport.normalizeForDatabase(this.options.tablename);
        chorus.PageEvents.subscribe("choice:setType", this.onSelectType, this);
    },

    onSelectType: function(data, linkMenu) {
        var $typeDiv = $(linkMenu.el).closest("div.type");
        $typeDiv.removeClass("float text").addClass(data);
    },

    postRender : function() {
        this.setupScrolling(this.$(".data_table"));
        var $dataTypes = this.$(".data_types");
        _.each(this.linkMenus, function(linkMenu, index){
            $dataTypes.find(".th").eq(index).find(".center").append(linkMenu.render().el);
        });
    },

    additionalContext: function() {
        var sandbox = chorus.page.workspace.sandbox();
        return {
            columns: this.csv.columnOrientedData(),
            directions: t("dataset.import.table.directions", {
                canonicalName: sandbox.schema().canonicalName(),
                tablename_input_field: "<input type='text' name='table_name' value='" + this.tableName + "'/>"
            })
        }
    }

});