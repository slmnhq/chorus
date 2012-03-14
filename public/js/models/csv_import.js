chorus.models.CSVImport = chorus.models.Base.extend({
    constructorName: "CSVImport",
    urlTemplate: "workspace/{{workspaceId}}/csv/import",


    columnOrientedData: function() {
        var parser = new CSV();

        try {
            parser.from(this.get("lines"), {delimiter: this.get("delimiter")});
            delete this.serverErrors;
        } catch (e) {
            if (e instanceof CSV.ParseError) {
                this.serverErrors = [ { message: t("dataset.import.invalid_csv") } ];
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

        return _.map(column_names, function(column_name, i) {
            var column_values = [];

            var type = "float";
            _.each(rows, function(row) {
                column_values.push(row[i] || "")
                if (type == "float" && isNaN(+row[i])) {
                    type = "text";
                }
            })
            return {values: column_values, name: column_name, type: type};
        });
    }
}, {
    normalizeForDatabase: function(str) {
        return _.str.underscored(str.toLowerCase()).replace(".", "_");
    }
});
