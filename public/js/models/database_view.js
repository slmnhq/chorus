// TODO - remove usages of this and DatabaseTable; use DatabaseObject instead
chorus.models.DatabaseView = chorus.models.DatabaseObject.extend({
    metaType: function() {
        return "view";
    }
});
