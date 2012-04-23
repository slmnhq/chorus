chorus.models.CSVImport = chorus.models.Base.extend({
    constructorName: "CSVImport",
    urlTemplate: "workspace/{{workspaceId}}/csv/import",

    declareValidations:function (newAttrs) {
        if(this.get("type") !== "existingTable") {
            this.requirePattern('toTable', chorus.ValidationRegexes.ChorusIdentifier64(), newAttrs, "import.validation.toTable.required");
        }
    },

    columnOrientedData: function() {
        var parser = new CSV();

        try {
            parser.from(this.get("lines"), {delimiter: this.get("delimiter")});
            delete this.serverErrors;
        } catch (e) {
            if (e instanceof CSV.ParseError) {
                this.serverErrors = [
                    { message: t("dataset.import.invalid_csv") }
                ];
                return [];
            } else {
                throw (e);
            }
        }

        var rows = parser.lines;

        var column_names = [];
        if (this.get("hasHeader")) {
            var header = rows.shift();
            if (!this.get("headerColumnNames")) {
                this.set({headerColumnNames: _.map(header, chorus.models.CSVImport.normalizeForDatabase) }, {silent: true});
            }
            column_names = this.get("headerColumnNames")
        } else {
            if (!this.get("generatedColumnNames")) {
                this.set({generatedColumnNames: _.map(rows[0], function(column, i) {
                    return "column_" + (i + 1);
                }) }, {silent: true});
            }
            column_names = this.get("generatedColumnNames");
        }

        if (!this.get("types")) {
            this.set({
                types: _.map(column_names, function(column_name, i) {
                    var type = "float";
                    _.each(rows, function(row) {
                        if (type == "float" && isNaN(+row[i])) {
                            type = "text";
                        }
                    })
                    return type;
                })
            }, {silent: true})
        }

        return _.map(column_names, function(column_name, i) {
            var column_values = [];
            _.each(rows, function(row) {
                column_values.push(row[i] || "")
            });
            return {values: column_values, name: column_name, type: this.get("types")[i]};
        }, this);
    }
}, {
    normalizeForDatabase: function(str) {
        return str.trim().toLowerCase().replace(/[\s.]/g, "_").replace(/[^a-z0-9_]/g, '').substring(0,64);
    }
});
