chorus.models.WorkfileVersion = chorus.models.Base.extend({
    constructorName: "WorkfileVersion",

    urlTemplate: "workfiles/{{id}}/versions/{{versionInfo.versionNum}}",

    initialize: function() {
        this._super('initialize');
        this.bind("destroy", function() {
            chorus.PageEvents.broadcast("workfile_version:deleted", this.get('versionInfo').versionNum);
        }, this);
    }
});
