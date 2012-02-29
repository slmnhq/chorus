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

        this.bindings.add(this.csv, "saved", this.saved);
        this.bindings.add(this.csv, "saveFailed", this.saveFailed);
    },

    saved: function() {
        this.closeModal();
        chorus.toast("dataset.import.started");
        chorus.PageEvents.broadcast("csv_import:started");
        chorus.router.navigate(this.dataset.showUrl(), true);
    },

    saveFailed: function() {
        this.$("button.submit").stopLoading();
    },

    render: function() {
        var api = this.$(".tbody").data("jsp");
        this.scrollPosX = api ? api.getContentPositionX() : 0;
        this.scrollPosY = api ? api.getContentPositionY() : 0;

        this._super("render", arguments);
    },

    postRender: function() {

        this.handleScrolling();
        this.cleanUpQtip();

        if(this.dataset.loaded){
            this.validateColumns();
        }

        var self = this;
        _.each(this.$(".column_mapping .map"), function(map, i) {
            var content = $("<ul></ul>");
            _.each(self.dataset.get("columnNames"), function(column) {
                content.append(_.bind(self.createQtipContent, self, column, self.destinations[i].name));
            });

            chorus.menu($(map), {
                content: content,
                classes: "table_import_csv",
                contentEvents: {
                    'a.name': _.bind(self.destinationColumnSelected, self)
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

    destinationColumnSelected: function(e, api) {
        e.preventDefault();
        var qtip_launch_link = api.elements.target.find("a");
        qtip_launch_link.text($(e.target).attr("title"));
        this.destinations = _.map(this.$(".column_mapping .map a"), function(link) {
            return {name: $(link).text()};
        });

        var self = this;

        this.destinations = _.map(this.destinations, function(destination) {
            var frequency = (_.filter(self.destinations, function(destination_loop) {
                return (destination.name != t("dataset.import.table.existing.select_one")) &&
                    ( destination.name === destination_loop.name)
            })).length;
            return _.extend(destination, {frequency: frequency});
        })

        this.render();
    },

    additionalContext: function() {
        var self = this;

        var columns = this.csv.columnOrientedData();
        columns = _.map(columns, function(column, index) {
            if (index >= self.destinations.length) {
                self.destinations.push({name: t("dataset.import.table.existing.select_one"), frequency: 0});
            }
            var selected_status = (self.destinations[index].frequency == 1) ? "selected" : "selection_conflict";

            return _.extend(column, {destination: self.destinations[index].name, selected_status: selected_status});
        });

        return {
            columns: columns,
            delimiter: this.other_delimiter ? this.delimiter : '',
            directions: t("dataset.import.table.existing.directions", {
                toTable: this.csv.get("toTable")
            }),
            count: (_.filter(self.destinations, function(destination) {
                    return destination.name != t("dataset.import.table.existing.select_one")
                }
            )).length,
            total: columns.length
        }
    },

    startImport: function() {
        this.$('button.submit').startLoading("dataset.import.importing");
        var self = this;

        var columnData = _.map(this.destinations, function(destination, i) {
            return {
                sourceOrder: i+1,
                targetOrder: _.indexOf(_.pluck(self.dataset.get("columnNames"), "name"), destination.name)+1
            }
        })
        this.csv.set({
            delimiter: this.delimiter,
            type: "existingTable",
            hasHeader: !!(this.$("#include_header").attr("checked")),
            columnsMap: JSON.stringify(columnData)
        }, {silent: true})

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
    },

    cleanUpQtip: function() {
        this.$(".column_mapping .map").qtip("destroy");
        this.$(".column_mapping .map").removeData("qtip");
    },

    handleScrolling: function() {
        var $tbody = this.$(".tbody");
        $tbody.unbind("scroll.follow_header");
        $tbody.bind("scroll.follow_header", _.bind(this.adjustHeaderPosition, this));
        $tbody.scrollTop(this.scrollPosY)
        $tbody.scrollLeft(this.scrollPosX);
        this.$(".thead").css({ "left": -this.scrollPosX });

        this.setupScrolling(this.$(".tbody"));
    },

    createQtipContent: function(column, selectedName) {
        var check_wrapper = $('<div class="check_wrapper"><span class="check hidden"></span></div>')

        if (column.name === selectedName) {
            check_wrapper.find(".check").removeClass("hidden");
        }
        var frequency = (_.filter(this.destinations, function(destination) {
            return destination.name === column.name
        })).length;
        var frequency_text = "";

        var selected_status = "unselected";
        if (frequency) {
            selected_status = frequency > 1 ? "selection_conflict" : "selected";
            frequency_text = " (" + frequency + ")";
        }

        return ($("<li>").append($(check_wrapper.outerHtml() +
            '<a class="name ' + selected_status + '" href="#" title="' + column.name + '">' + column.name + frequency_text + '</a>' +
            '<span class="type">' + chorus.models.DatabaseColumn.humanTypeMap[column.typeCategory] + '</span>')));
    },

    validateColumns: function() {
        var sourceColumnsNum = this.csv.columnOrientedData().length;
        var destinationColumnsNum = this.dataset.get("columnNames").length
        if( destinationColumnsNum < sourceColumnsNum) {
            this.resource.serverErrors = [{ message: t("dataset.import.table.too_many_source_columns")}];
            this.resource.trigger("validationFailed");
        } else {
            this.resource.serverErrors = undefined;
        }
    }
});