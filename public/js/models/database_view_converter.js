chorus.models.DatabaseViewConverter = chorus.models.Base.extend({
    initialize: function(attrs, options) {
        this.options = options || {};
        this.from = this.options.from;
    },

    url: function() {
        return "/edc/workspace/" + this.from.get("workspace").id
            + "/dataset/" + encodeURIComponent(this.from.get("id"))
            + "/convert";
    }
});