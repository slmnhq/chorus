chorus.views.TabularDataStatistics = chorus.views.Base.extend({
    templateName: "tabular_data_statistics",

    setup: function(options) {
        this.column = options.column;

        this.statistics = this.model.statistics();
        this.statistics.fetchIfNotLoaded();
        this.statistics.onLoaded(this.render, this);
    },

    context: function() {
        var ctx = {
            column: this.column && this.column.attributes
        };

        ctx.objectName = this.model.get("objectName");
        ctx.typeString = Handlebars.helpers.humanizedTabularDataType(this.model && this.model.attributes)

        if (!this.statistics) { return ctx; }

        ctx.statistics = this.statistics.attributes;
        if (ctx.statistics.rows === 0) {
            ctx.statistics.rows = "0";
        }

        if (ctx.statistics.columns === 0) {
            ctx.statistics.columns = "0";
        }

        return ctx;
    }
});
