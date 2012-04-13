chorus.dialogs.ExistingTableImportCSV = chorus.dialogs.Base.extend({
    className: "existing_table_import_csv",
    additionalClass: "table_import_csv",
    title: t("dataset.import.table.title"),
    delimiter: ',',

    events: {
        "click button.submit": "startImport",
        "change #hasHeader": "refreshCSV",
        "keyup input.delimiter[name=custom_delimiter]": "setOtherDelimiter",
        "paste input.delimiter[name=custom_delimiter]": "setOtherDelimiter",
        "click input.delimiter[type=radio]": "setDelimiter",
        "click input#delimiter_other": "focusOtherInputField",
        "click a.automap": "automap"
    },

    setup: function() {
        this.resource = this.csv = this.options.csv;
        this.tableName = this.csv.get("toTable");
        this.dataset = new chorus.models.Dataset({ workspace: {id: this.csv.get("workspaceId")}, id: this.options.datasetId })

        this.requiredResources.add(this.dataset);
        this.dataset.fetch();
        var columns = this.csv.columnOrientedData();
        this.numberOfColumns = columns.length;
        this.destinationColumns = _.map(columns, function() { return null });
        this.destinationMenus = [];

        this.bindings.add(this.csv, "saved", this.saved);
        this.bindings.add(this.csv, "saveFailed", this.saveFailed);
        this.bindings.add(this.csv, "validationFailed", this.saveFailed);
    },

    saved: function() {
        this.closeModal();
        chorus.toast("dataset.import.started");
        chorus.PageEvents.broadcast("csv_import:started");
        chorus.router.navigate(this.dataset.showUrl());
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

        if (this.csv.serverErrors) {
            this.showErrors();
        }

        if (this.dataset.loaded) {
            this.validateColumns();
        }

        _.each(this.$(".column_mapping .map a"), function(map, i) {
            var menuContent = this.$(".menu_content ul").clone();
            this.destinationMenus[i] = menuContent;
            chorus.menu($(map), {
                content: menuContent,
                classes: "table_import_csv",
                contentEvents: {
                    'a.name': _.bind(this.destinationColumnSelected, this)
                },
                position: {
                    my: "left center",
                    at: "right center"
                },
                mimic: "left center"
            });
        }, this);
        this.updateDestinations();

        this.$("input.delimiter").prop("checked", false);
        if (_.contains([",", "\t", ";", " "], this.delimiter)) {
            this.$("input.delimiter[value='" + this.delimiter + "']").prop("checked", true);
        } else {
            this.$("input#delimiter_other").prop("checked", true);
        }

    },

    destinationColumnSelected: function(e, api) {
        e.preventDefault();
        var destinationColumnLinks = this.$(".column_mapping .map a");
        var qtipLaunchLink = api.elements.target;
        var selectedColumnName = $(e.target).attr("title");
        var selectedColumnIndex = destinationColumnLinks.index(qtipLaunchLink);
        this.destinationColumns[selectedColumnIndex] = selectedColumnName;
        this.updateDestinations();
    },

    updateDestinations: function() {
        var frequenciesByDestinationColumn = {};
        _.each(this.destinationColumns, function(name) {
            if (!name) return;
            frequenciesByDestinationColumn[name] = _.filter(this.destinationColumns, function(name2) {
                return name && name === name2;
            }).length;
        }, this);

        var frequenciesBySourceColumn = _.map(this.destinationColumns, function(name) {
            return frequenciesByDestinationColumn[name];
        });

        this.updateDestinationLinks(frequenciesByDestinationColumn);
        this.updateDestinationMenus(frequenciesByDestinationColumn);
        this.updateDestinationCount();

        var invalidMapping = _.any(frequenciesBySourceColumn, function(f) { return f !== 1; });
        this.$("button.submit").prop("disabled", invalidMapping);
    },

    updateDestinationLinks: function(frequencies) {
        var launchLinks = this.$(".column_mapping .map a");
        _.each(launchLinks, function(launchLink, i) {
            launchLink = $(launchLink);
            var columnName = this.destinationColumns[i];
            var frequency = frequencies[columnName];

            launchLink.find(".column_name").text(columnName || t("dataset.import.table.existing.select_one"));
            launchLink.toggleClass("selected", (frequency === 1));
            launchLink.toggleClass("selection_conflict", (frequency != 1));
        }, this);
    },

    updateDestinationMenus: function(frequencies) {
        _.each(this.destinationMenus, function(menu, i) {
            menu.find(".count").text("");
            menu.find(".name").removeClass("selected");
            _.each(this.destinationColumns, function(name) {
                var frequency = frequencies[name];
                if (frequency > 0) {
                    menu.find("li[name=" + name + "] .count").text(" (" + frequency + ")");
                }
                if (frequency > 1) {
                    menu.find("li[name=" + name + "] .name").addClass("selection_conflict");
                }
            });

            var $selectedLi = menu.find("li[name=" + this.destinationColumns[i] + "]");
            menu.find(".check").addClass("hidden");
            $selectedLi.find(".check").removeClass("hidden");
            $selectedLi.find(".name").addClass("selected");
        }, this);
    },

    updateDestinationCount: function() {
        var count = _.compact(this.destinationColumns).length;
        var total = this.numberOfColumns;
        if (count > total) {
            count = total;
        }
        this.$(".progress").text(t("dataset.import.table.progress", {count: count, total: total}));
    },

    additionalContext: function() {
        return {
            columns: this.csv.columnOrientedData(),
            destinationColumns: _.map(this.dataset.get("columnNames"), function(column) {
                return { name: column.name, type: chorus.models.DatabaseColumn.humanTypeMap[column.typeCategory] };
            }),
            delimiter: this.other_delimiter ? this.delimiter : '',
            directions: t("dataset.import.table.existing.directions", {
                toTable: new Handlebars.SafeString(chorus.helpers.spanFor(this.csv.get("toTable"), {"class": "destination"}))
            })
        }
    },

    startImport: function() {
        this.$('button.submit').startLoading("dataset.import.importing");
        var self = this;

        var columnData = _.map(this.destinationColumns, function(destination, i) {
            var column = _.find(self.dataset.get("columnNames"), function(column) {
                return column.name === destination;
            });

            return {
                sourceOrder: i + 1,
                targetOrder: column ? column.ordinalPosition : 0
            }
        });

        this.csv.set({
            delimiter: this.delimiter,
            type: "existingTable",
            hasHeader: !!(this.$("#hasHeader").prop("checked")),
            columnsMap: JSON.stringify(columnData)
        }, { silent: true });

        this.$("button.submit").startLoading("dataset.import.importing");

        this.csv.save();
    },

    refreshCSV: function() {
        this.csv.set({hasHeader: !!(this.$("#hasHeader").prop("checked")), delimiter: this.delimiter});
        this.csv.unset("types")
        this.numberOfColumns = this.csv.columnOrientedData().length;
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

        this.csv.unset("headerColumnNames", {silent: true});
        this.csv.unset("generatedColumnNames", {silent: true});

        this.refreshCSV();
    },

    focusOtherInputField: function(e) {
        this.$("input[name=custom_delimiter]").focus();
    },

    setOtherDelimiter: function() {
        this.$("input.delimiter[type=radio]").prop("checked", false);
        var otherRadio = this.$("input#delimiter_other");
        otherRadio.prop("checked", true)
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

    validateColumns: function() {
        var sourceColumnsNum = this.csv.columnOrientedData().length;
        var destinationColumnsNum = this.dataset.get("columnNames") ? this.dataset.get("columnNames").length : 0;
        if (destinationColumnsNum < sourceColumnsNum) {
            this.resource.serverErrors = [
                { message: t("dataset.import.table.too_many_source_columns")}
            ];
            this.resource.trigger("validationFailed");
        } else {
            var errors = _.reject(this.resource.serverErrors, function(item) {
                return item.message === t("dataset.import.table.too_many_source_columns");
            });

            if (errors.length == 0) {
                delete this.resource.serverErrors;
            } else {
                this.resource.serverErrors = errors;
            }
        }
    },

    automap: function(e) {
        e && e.preventDefault();

        for(var i = 0; i< this.numberOfColumns; i++) {
            this.destinationColumns[i] = this.dataset.get("columnNames")[i].name;
        }

        this.updateDestinations();
    }
});
