chorus.models.Artifact = chorus.models.Base.extend({
    constructorName: "Artifact",

    iconUrl: function(options) {
        return chorus.urlHelpers.fileIconUrl(this.get("type"), options && options.size);
    },

    downloadUrl:function () {
        return "/edc/file/" + this.get("id");
    }
});