chorus.utilities.CsvParser = function(model, options) {
    this.model = model;
    this.options = _.extend({
        hasHeader: true,
        delimiter: ","
    }, options);

    this.columnOrientedData = function() {
        var parser = new CSV();

        try {
            parser.from(this.model.get("contents"), {delimiter: this.options.delimiter});
            delete this.serverErrors;
        } catch (e) {
            if (e instanceof CSV.ParseError) {
                this.serverErrors = {fields: {delimiter: {INVALID: {}}}};
                return [];
            } else {
                throw (e);
            }
        }

        var rows = parser.lines;

        var column_names;
        if (this.options.hasHeader) {
            column_names = this.options.headerColumnNames;
            var header = rows.shift();
            if (!column_names) {
                column_names = _.map(header, chorus.utilities.CsvParser.normalizeForDatabase);
            }
        } else {
            column_names = this.options.generatedColumnNames;
            if (!column_names) {
                column_names = _.map(rows[0], function(column, i) {
                    return "column_" + (i + 1);
                });
            }
        }

        var types = this.options.types;
        if (!types) {
            types = _.map(column_names, function(column_name, i) {
                var type = "float";
                _.each(rows, function(row) {
                    if (type == "float" && isNaN(+row[i])) {
                        type = "text";
                    }
                })
                return type;
            });
        }

        return _.map(column_names, function(column_name, i) {
            var column_values = [];
            _.each(rows, function(row) {
                column_values.push(row[i] || "")
            });
            return {values: column_values, name: column_name, type: types[i]};
        }, this);
    }


    return this;
}

chorus.utilities.CsvParser.normalizeForDatabase = function(str) {
    return str.trim().toLowerCase().replace(/[\s.]/g, "_").replace(/[^a-z0-9_]/g, '').substring(0, 64);
}