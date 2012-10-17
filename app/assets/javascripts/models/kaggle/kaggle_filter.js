chorus.models.KaggleFilter = chorus.models.Filter.extend({
    constructorName: "KaggleFilter",

    getFilterMap: function() {
        switch (this.has("column") && this.get("column").get("name")) {
            case "Favorite Techniques":
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
    }
});