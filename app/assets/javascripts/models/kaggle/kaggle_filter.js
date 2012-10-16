chorus.models.KaggleFilter = chorus.models.Filter.extend({
    constructorName: "KaggleFilter",

    getFilterMap: function() {
        switch (this.has("column") && this.get("column").get("name")) {
            case "fav_techniques":
            case "location":
            case "fav_software":
                return new chorus.models.KaggleFilterMaps.String
                break;
            case "rank":
            case "competitions":
                return new chorus.models.KaggleFilterMaps.Numeric
                break;
            case "competition_types":
                return new chorus.models.KaggleFilterMaps.CompetitionType
                break;
            default:
                return new chorus.models.KaggleFilterMaps.Other
                break;
        }
    }
});