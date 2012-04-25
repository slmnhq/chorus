chorus.models.DatabaseViewConverter = chorus.models.Base.extend({
    initialize: function(attrs, options) {
        this.options = options || {};
        this.from = this.options.from;
    },

    databaseView: function(){
        // server response to the 'convert' call is the created db view,
        // so this model's attributes suffice to build a dataset
        return new chorus.models.Dataset(this.attributes);
    },

    url: function() {
        return "/workspace/" + this.from.get("workspace").id
            + "/dataset/" + encodeURIComponent(this.from.get("id"))
            + "/convert";
    }
});