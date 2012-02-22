chorus.dialogs.TableImportCSV = chorus.dialogs.Base.extend({
    className: "table_import_csv",
    title: t("dataset.import.table.title"),

    events: {
      "click button.submit": "startImport",
      "change #include_header": "refreshCSV"
    },

    setup: function() {
        this.resource = this.csv = this.options.csv;
        this.tableName = this.csv.get("toTable");
        chorus.PageEvents.subscribe("choice:setType", this.onSelectType, this);
    },

    onSelectType: function(data, linkMenu) {
        var $typeDiv = $(linkMenu.el).closest("div.type");
        $typeDiv.removeClass("integer float text date time timestamp").addClass(data);
    },

    postRender : function() {
        this.$(".tbody").unbind("scroll.follow_header");
        this.$(".tbody").bind("scroll.follow_header", _.bind(this.adjustHeaderPosition, this));
        this.setupScrolling(this.$(".tbody"));

        var $dataTypes = this.$(".data_types");
        this.linkMenus = _.map(this.csv.columnOrientedData(), function(item) {
                    return new chorus.views.LinkMenu({
                        options: [
                            {data: "integer", text: "integer"},
                            {data: "float", text: "float"},
                            {data: "text", text: "text"},
                            {data: "date", text: "date"},
                            {data: "time", text: "time"},
                            {data: "timestamp", text: "timestamp"}
                        ],
                        title: '',
                        event: "setType",
                        chosen: item.type
                    });
        });
        _.each(this.linkMenus, function(linkMenu, index){
            $dataTypes.find(".th").eq(index).find(".center").append(linkMenu.render().el);
        });
    },

    additionalContext: function() {
        return {
            columns: this.csv.columnOrientedData(),
            directions: t("dataset.import.table.directions", {
               tablename_input_field: "<input type='text' name='table_name' value='" + this.tableName + "'/>"
            })
        }
    },

    startImport: function() {
        this.$('button.submit').startLoading("dataset.import.importing");
        var $names = this.$(".column_names input:text");
        var $types = this.$(".data_types .chosen");

        var columnData = _.map($names, function(name, i) {
            return {
                columnName: chorus.Mixins.dbHelpers.safePGName($(name).val()),
                columnType: $types.eq(i).text(),
                columnOrder: i+1
            }
        })
        this.csv.set({
            toTable: chorus.models.CSVImport.normalizeForDatabase(this.$(".directions input:text").val()),
            delimiter: ",",
            columnsDef: JSON.stringify(columnData)
        })

        this.csv.bindOnce("saved", function(){
            this.closeModal();
            chorus.toast("dataset.import.started");
            chorus.PageEvents.broadcast("csv_import:started");
        }, this);

        this.csv.bindOnce("saveFailed", function() {
            this.$("button.submit").stopLoading();
        }, this);

        this.$("button.submit").startLoading("dataset.import.importing");

        this.csv.save();
    },

    refreshCSV : function() {
        this.csv.set({include_header: !!(this.$("#include_header").attr("checked"))});
        this.render();
        this.recalculateScrolling();
    },

    adjustHeaderPosition: function() {
        this.$(".thead").css({ "left": -this.scrollLeft() });
    },

    scrollLeft: function() {
        var api = this.$(".tbody").data("jsp");
        return api && api.getContentPositionX();
    }
});