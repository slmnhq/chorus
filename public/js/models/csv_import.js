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
            column_names = _.map(rows.shift(), chorus.models.CSVImport.normalizeForDatabase);
        } else {
            column_names = _.map(rows[0], function(column, i) {
                return "column_" + (i + 1);
            });
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
        return _.str.underscored(str.toLowerCase());
    }
});
