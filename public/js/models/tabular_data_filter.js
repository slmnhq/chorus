chorus.models.TabularDataFilter = chorus.models.Base.extend({
    setColumn: function(column) {
        if (!this.get("column") || (this.get("column").cid !== column.cid)) {
            this.set({column: column});
            this.unset("comparator");
            this.unset("input");
        }
    },

    setComparator: function(comparator) {
        this.set({comparator: comparator});
    },

    setInput: function(inputHash) {
        this.set({input: inputHash});
    },

    getFilterMap: function() {
        switch (this.get("column").get("typeCategory")) {
            case "STRING":
            case "LONG_STRING":
                return new chorus.models.DatasetFilterMaps.String
                break;
            case "BOOLEAN":
                return new chorus.models.DatasetFilterMaps.Boolean
                break;
            case "WHOLE_NUMBER":
            case "REAL_NUMBER":
                return new chorus.models.DatasetFilterMaps.Numeric
                break;
            case "DATE":
                return new chorus.models.DatasetFilterMaps.Date
                break;
            case "TIME":
                return new chorus.models.DatasetFilterMaps.Time
                break;
            case "DATETIME":
                return new chorus.models.DatasetFilterMaps.Timestamp
                break;
            default:
                return new chorus.models.DatasetFilterMaps.Other
                break;
        }
    },

    sqlString: function() {
        var columnName = this.get("column") && this.get("column").quotedName();
        var comparatorName = this.get("comparator");
        var inputValue = this.get("input") && this.get("input").value;

        return this.getFilterMap().comparators[comparatorName].generate(columnName, inputValue);
    }
});