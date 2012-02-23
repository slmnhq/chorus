chorus.dialogs.TableImportCSV = chorus.dialogs.Base.extend({
    className: "table_import_csv",
    title: t("dataset.import.table.title"),
//    useLoadingSection:true,
    delimiter: ',',

    events: {
      "click button.submit": "startImport",
        "change #include_header": "refreshCSV",
        "keyup input.delimiter[name=other_delimiter]": "setOtherDelimiter",
        "paste input.delimiter[name=other_delimiter]": "setOtherDelimiter",
        "click input.delimiter[type=radio]": "setDelimiter",
        "click input#delimiter_other": "focusOtherInputField"
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

        this.$("input.delimiter").removeAttr("checked");
        this.$("input.delimiter[value='" + this.delimiter + "']").attr("checked", "true");
    },

    additionalContext: function() {
        return {
            columns: this.csv.columnOrientedData(),
            delimiter: ",; \t".indexOf(this.delimiter) < 0 ? this.delimiter : '',
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
            delimiter: this.delimiter,
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
        this.csv.set({include_header: !!(this.$("#include_header").attr("checked")), delimiter: this.delimiter});
        this.render();
        this.recalculateScrolling();
    },

    adjustHeaderPosition: function() {
        this.$(".thead").css({ "left": -this.scrollLeft() });
    },

    scrollLeft: function() {
        var api = this.$(".tbody").data("jsp");
        return api && api.getContentPositionX();
    },

    setDelimiter: function(e) {
        this.delimiter = e.target.value || this.$("input[name=other_delimiter]").val();
        this.refreshCSV();
    },

    focusOtherInputField: function(e) {
        this.$("input[name=other_delimiter]").focus();
    },

    setOtherDelimiter: function() {
        this.$("input.delimiter[type=radio]").removeAttr("checked");
        var otherRadio = this.$("input#delimiter_other");
        otherRadio.attr("checked", true)
        otherRadio.click();
    }
});