chorus.models.KaggleFilter = chorus.models.Base.extend({
    constructorName: "KaggleFilter",

    setColumn: function(column) {
        this.set({ 'column': column })
    }
});