(function() {
    chorus.models.KaggleFilterMaps = {};

    chorus.models.KaggleFilterMaps.Numeric = chorus.models.Base.extend({
        comparators: {
            "greater": ">",
            "less": "<"
        },

        declareValidations: function(attrs) {
            this.requirePattern("value", /^-?[0-9]+[.,]?[0-9]*$/, attrs, "kaggle.filter.rank_required");
        }
    });

    chorus.models.KaggleFilterMaps.String = chorus.models.Base.extend({
        declareValidations: function(attrs) {
            return true;
        }
    });

    chorus.models.KaggleFilterMaps.Type = chorus.models.Base.extend({
        declareValidations: function(attrs) {
            return this.require('value', attrs)
        }
    });
})();