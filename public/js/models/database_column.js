(function(ns) {
    ns.models.DatabaseColumn = chorus.models.Base.extend({
        toString: function() {
            return '"' + this.get("schemaName") + '"."' + this.get("parentName")
                + '"."' + this.get("name") + '"'
        }
    });
})(chorus);