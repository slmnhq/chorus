(function(ns) {
    ns.models.DatabaseColumn = chorus.models.Base.extend({
        toString: function() {
            return this.safePGName(this.get("schemaName")) + '.' + this.safePGName(this.get("parentName"))
                + '.' + this.safePGName(this.get("name"));
        }
    });
})(chorus);