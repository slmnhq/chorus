(function() {
    chorus.models.KaggleFilterMaps = {};

    chorus.models.KaggleFilterMaps.Numeric = chorus.models.Base.extend({
        comparators: {
            "greater": { usesInput: true, condition: ">" },
            "less": { usesInput: true, condition: "<" }
        },

        declareValidations: function(attrs) {
            this.requirePattern("value", /^-?[0-9]+[.,]?[0-9]*$/, attrs, "kaggle.filter.rank_required", "allowBlank");
        }
    });

    chorus.models.KaggleFilterMaps.String = chorus.models.Base.extend({
        comparators: {
            "equal": { usesInput: true, condition: "=" }
        },

        declareValidations: function(attrs) {
            return true;
        }
    });

    chorus.models.KaggleFilterMaps.CompetitionType = chorus.models.Base.extend({
        comparators: {
            "equal": { usesSelect: true, condition: "=" }
        },
        declareValidations: function(attrs) {
            return this.require('value', attrs)
        }
    });    chorus.models.KaggleFilterMaps.Other = chorus.models.Base.extend({
        type: "Other",

        declareValidations: function(attrs) {
        }
    });
})();