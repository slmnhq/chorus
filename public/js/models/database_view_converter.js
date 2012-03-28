chorus.models.DatabaseViewConverter = chorus.models.Base.extend({
    initialize: function(attrs, options) {
        this.options = options || {};
    },

    url: function() {
        return "/edc/workspace/" + this.options.from.get("workspace").id
            + "/dataset/" + encodeURIComponent(this.options.from.get("id"))
            + "/convert?objectName=" + encodeURIComponent(this.name);
    }
});