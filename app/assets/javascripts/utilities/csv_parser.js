chorus.utilities.CsvParser = function(contents, options) {
    this.contents = contents;
    this.options = _.extend({
        hasHeader: true,
        delimiter: ","
    }, options);
    this.rows = [];

    this.parse = function() {
        var parser = new CSV();

        try {
            parser.from(this.contents, {delimiter: this.options.delimiter});
            delete this.serverErrors;
        } catch (e) {
            if (e instanceof CSV.ParseError) {
                this.serverErrors = {fields: {delimiter: {INVALID: {}}}};
                return [];
            } else {
                throw (e);
            }
        }

        this.rows = parser.lines;
    };

    this.parse();

    this.generateColumnNames = function() {
        return _.map(this.rows[0], function(column, i) {
            return "column_" + (i + 1);
        });
    };

    this.parseColumnNames = function() {
        return _.map(this.rows.shift(), chorus.utilities.CsvParser.normalizeColumnName);
    };

    this.overrideColumnNames = function() {
        return this.options.columnNameOverrides;
    };

    this.getColumnOrientedData = function() {
        var columnNames;
        if(this.options.hasHeader) {
            columnNames = this.parseColumnNames();
        } else {
            columnNames = this.generateColumnNames();
        }
        if (this.options.columnNameOverrides) {
            columnNames = this.overrideColumnNames();
        }

        var types = this.options.types;
        if (!types) {
            types = _.map(columnNames, function(columnName, i) {
                var type = "float";
                _.each(this.rows, function(row) {
                    if (type == "float" && isNaN(+row[i])) {
                        type = "text";
                    }
                }, this);
                return type;
            }, this);
        }

        return _.map(columnNames, function(columnName, i) {
            var columnValues = [];
            _.each(this.rows, function(row) {
                columnValues.push(row[i] || "")
            });
            return {values: columnValues, name: columnName, type: types[i]};
        }, this);
    }

    return this;
}

chorus.utilities.CsvParser.normalizeForDatabase = function(str) {
    return str.trim().replace(/[\s.]/g, "_").replace(/[^a-z0-9_]/g, '').substring(0, 64);
}

chorus.utilities.CsvParser.normalizeColumnName = function(str) {
    return chorus.utilities.CsvParser.normalizeForDatabase(str.toLowerCase());
}

