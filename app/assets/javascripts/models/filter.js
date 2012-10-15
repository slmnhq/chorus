chorus.models.Filter = chorus.models.Base.extend({
    constructorName: "Filter",

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

    getFilterMap: $.noop
});