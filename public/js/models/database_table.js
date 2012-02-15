// TODO - remove usages of this and DatabaseView; use DatabaseObject instead
chorus.models.DatabaseTable = chorus.models.DatabaseObject.extend({
    metaType: function() {
        return "table";
    }
});
