chorus.dialogs.ExistingTableImportCSV = chorus.dialogs.Base.extend({
    className: "existing_table_import_csv",
    additionalClass: "table_import_csv",
    title: t("dataset.import.table.title"),
    delimiter: ',',

    events: {
        "click button.submit": "startImport",
        "change #include_header": "refreshCSV",
        "keyup input.delimiter[name=custom_delimiter]": "setOtherDelimiter",
        "paste input.delimiter[name=custom_delimiter]": "setOtherDelimiter",
        "click input.delimiter[type=radio]": "setDelimiter",
        "click input#delimiter_other": "focusOtherInputField"
    },

    setup: function() {
        this.resource = this.csv = this.options.csv;
        this.tableName = this.csv.get("toTable");
        chorus.PageEvents.subscribe("choice:setType", this.onSelectType, this);
        this.dataset = new chorus.models.Dataset({ workspace: {id: this.csv.get("workspaceId")}, id: this.options.datasetId })
        this.requiredResources.add(this.dataset);
        this.dataset.fetch();
        this.destinations = [];
    },

    postRender: function() {
        this.$(".tbody").unbind("scroll.follow_header");
        this.$(".tbody").bind("scroll.follow_header", _.bind(this.adjustHeaderPosition, this));
        this.setupScrolling(this.$(".tbody"));

        this.$(".column_mapping .map").qtip("destroy");
        this.$(".column_mapping .map").removeData("qtip");
        var self = this;
        _.each(this.$(".column_mapping .map"), function(map, i) {
            var content = $("<ul></ul>");
            _.each(self.dataset.get("columnNames"), function(column) {
                var check = $('<div class="check_wrapper"><span class="check hidden"></span></div>')
                if(column.name === self.destinations[i]) {
                    check.removeClass("hidden");
                }
                content.append($("<li>").append($(check.outerHtml() +
                    '<a class="name" href="#">' + column.name + '</a>'+
                '<span class="type">'+chorus.models.DatabaseColumn.humanTypeMap[column.typeCategory]+'</span>')));
            });

            chorus.menu($(map), {
                content: content,
                classes: "table_import_csv",
                contentEvents: {
                    'a.name': _.bind(self.columnSelected, self)
                }
            });
        })

        self.$("input.delimiter").removeAttr("checked");
        if (_.contains([",", "\t", ";", " "], self.delimiter)) {
            self.$("input.delimiter[value='" + self.delimiter + "']").attr("checked", "true");
        } else {
            self.$("input#delimiter_other").attr("checked", "true");
        }
    },

    columnSelected: function(e, api) {
        e.preventDefault();
        $(e.target).closest("ul").find(".check").addClass("hidden");
        $(e.target).siblings(".check_wrapper").find(".check").removeClass("hidden");
        api.elements.target.find("a").text($(e.target).text());
        this.destinations = _.map(this.$(".column_mapping .map a"), function(link){
           return $(link).text();
        })
    },

    additionalContext: function() {
        var self = this;

        var columns = this.csv.columnOrientedData();
        columns = _.map(columns, function(column, index){
            if(index >= self.destinations.length){
                self.destinations.push(t("dataset.import.table.existing.select_one"));
            }
            return _.extend(column, {destination: self.destinations[index]});
        })

        return {
            columns: columns,
            delimiter: this.other_delimiter ? this.delimiter : '',
            directions: t("dataset.import.table.existing.directions", {
                toTable: this.csv.get("toTable")
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
                columnOrder: i + 1
            }
        })
        this.csv.set({
            delimiter: this.delimiter,
            columnsDef: JSON.stringify(columnData)
        })

        this.csv.bindOnce("saved", function() {
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

    refreshCSV: function() {
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