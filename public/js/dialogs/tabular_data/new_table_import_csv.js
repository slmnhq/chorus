chorus.dialogs.NewTableImportCSV = chorus.dialogs.Base.extend({
    className: "new_table_import_csv",
    additionalClass: "table_import_csv",
    title: t("dataset.import.table.title"),
    ok: t("dataset.import.table.submit"),
    loadingKey: "dataset.import.importing",

    delimiter: ',',

    events: {
      "click button.submit": "startImport",
        "change #hasHeader": "refreshCSV",
        "keyup input.delimiter[name=custom_delimiter]": "setOtherDelimiter",
        "paste input.delimiter[name=custom_delimiter]": "setOtherDelimiter",
        "click input.delimiter[type=radio]": "setDelimiter",
        "click input#delimiter_other": "focusOtherInputField"
    },

    setup: function() {
        this.resource = this.csv = this.options.csv;
        this.csv.set({hasHeader: true});
        this.tableName = this.csv.get("toTable");
        chorus.PageEvents.subscribe("choice:setType", this.onSelectType, this);

        this.bindings.add(this.csv, "saved", this.saved);
        this.bindings.add(this.csv, "saveFailed", this.saveFailed);
    },

    saved: function() {
        this.closeModal();
        chorus.toast("dataset.import.started");
        chorus.PageEvents.broadcast("csv_import:started");
    },

    saveFailed: function() {
        this.$("button.submit").stopLoading();
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

        var columns = this.csv.columnOrientedData();
        if (this.csv.serverErrors) {
            this.showErrors();
        }

        this.linkMenus = _.map(columns, function(item) {
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
        if(_.contains([",", "\t", ";", " "], this.delimiter)){
            this.$("input.delimiter[value='" + this.delimiter + "']").attr("checked", "true");
        } else {
            this.$("input#delimiter_other").attr("checked", "true");
        }
    },

    additionalContext: function() {
        return {
            columns: this.csv.columnOrientedData(),
            delimiter: this.other_delimiter ? this.delimiter : '',
            directions: t("dataset.import.table.new.directions", {
               tablename_input_field: "<input type='text' name='table_name' value='" + this.tableName + "'/>"
            }),
            ok: this.ok
        }
    },

    startImport: function() {
        if (this.performValidation()) {
            this.prepareCsv();

            this.$("button.submit").startLoading(this.loadingKey);

            this.csv.save();
        }
    },

    prepareCsv: function() {
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
    },

    performValidation : function() {
        var $names = this.$(".column_names input:text");
        var pattern = /^[a-zA-Z][a-zA-Z0-9_]{0,63}/;
        var allValid = true;
        _.each($names, function(name, i){
            var $name = $names.eq(i);
            if (!$name.val().match(pattern)) {
                allValid = false;
                this.markInputAsInvalid($name, t("import.validation.column_name"), true);
            }
        }, this);

        return allValid;
    },

    refreshCSV : function() {
        this.csv.set({hasHeader: !!(this.$("#hasHeader").prop("checked")), delimiter: this.delimiter});
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
        if (e.target.value == "other") {
            this.delimiter = this.$("input[name=custom_delimiter]").val();
            this.other_delimiter = true;
        } else {
            this.delimiter = e.target.value;
            this.other_delimiter = false;
        }
        this.refreshCSV();
    },

    focusOtherInputField: function(e) {
        this.$("input[name=custom_delimiter]").focus();
    },

    setOtherDelimiter: function() {
        this.$("input.delimiter[type=radio]").removeAttr("checked");
        var otherRadio = this.$("input#delimiter_other");
        otherRadio.attr("checked", true)
        otherRadio.click();
    }
});
