;(function(ns) {
    ns.models.Artifact = ns.models.Base.extend({
        downloadUrl: function() {
            return "/edc/file/" + this.get("entityId");
        }
    });
})(chorus);