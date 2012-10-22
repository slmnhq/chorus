chorus.models.KaggleFilter = chorus.models.Filter.extend({
    constructorName: "KaggleFilter",

    getFilterMap: function() {
        switch (this.has("column") && this.get("column").get("name")) {
            case "Favorite Technique":
            case "Location":
            case "Favorite Software":
                return new chorus.models.KaggleFilterMaps.String
                break;
            case "Rank":
            case "Number of Entered Competitions":
                return new chorus.models.KaggleFilterMaps.Numeric
                break;
            case "Past Competition Types":
                return new chorus.models.KaggleFilterMaps.CompetitionType
                break;
            default:
                return new chorus.models.KaggleFilterMaps.Other
                break;
        }
    },

    filterParams: function() {
        if (this.get("input") && this.get("input").value) {
            return encodeURIComponent(_.underscored(this.get("column").get("name"))) + "|" +
                encodeURIComponent(this.get("comparator")) + "|" + encodeURIComponent((this.get("input").value));
        } else {
            return null;
        }
    }
});