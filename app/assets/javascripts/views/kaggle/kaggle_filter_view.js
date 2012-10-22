chorus.views.KaggleFilter = chorus.views.Filter.extend({
    templateName: "kaggle_filter",
    tagName: 'li',

    setup: function() {
        this.collection = this.collection || new chorus.collections.KaggleColumnSet();
        this.model = this.model || new chorus.models.KaggleFilter();
        this._super("setup", arguments);
        this.bindings.add(this.columnFilter, "refresh", this.columnSelected);
    },

    postRender: function() {
        this._super("postRender", arguments);
        this.populateCompetitionType();
    },

    //TODO populate the input values after the render or remove the filters

    populateCompetitionType: function() {
        //TODO: replace this with actual data from api once it's implemented
        var list = ["natural language processing", "high dimensionality", "unsupervised learning",
            "supervised learning", "semi-supervised learning", "computer vision", "data manipulation",
            "unstructured", "exploratory", "visualization", "graph", "social", "time series",
            "binary classification", "multiclass classification", "regression", "ranking", "QSAR", "actuarial",
            "insurance", "health", "life sciences", "research", "government", "public policy", "retail",
            "start-ups", "finance", "credit", "natural language processing", "high dimensionality",
            "unsupervised learning", "supervised learning", "semi-supervised learning", "computer vision",
            "data manipulation", "unstructured", "exploratory", "visualization", "graph", "social",
            "time series", "binary classification", "multiclass classification", "regression", "ranking", "QSAR"];

        var $select = this.$(".filter.competition_type select");
        _.each(list, function(name, index) {
            var el = $("<option/>").text(name).attr("value", name);
            $select.append(el);
        }, this);


        _.defer(function() {
            chorus.styleSelect($select, { menuWidth: 240 });
        });
    }
});