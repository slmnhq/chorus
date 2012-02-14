chorus.models.CSVImport = chorus.models.Base.extend({

    columnOrientedData: function() {
        var parser = new CSV()
        parser.from(this.get("lines"), {delimiter: this.get("delimiter")});
        var rows = parser.lines;
        var column_names = rows.shift();
        return _.map(column_names, function(column_name, i) {
            var column_values = [];
            _.each(rows, function(row){
                    column_values.push(row[i])
            })
            return {values: column_values, name: column_name};
        });
    }
});
