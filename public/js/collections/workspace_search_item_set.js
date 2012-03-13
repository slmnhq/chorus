(function() {
    var constructorMap = {
        workfile:       chorus.models.Workfile,
        databaseObject: chorus.models.DynamicTabularData,
        chorusView:     chorus.models.DynamicTabularData,
        workspace:      chorus.models.Workspace
    };

    chorus.collections.WorkspaceSearchItemSet = chorus.collections.Base.extend({
        model: function(modelJson, options) {
            var constructor = constructorMap[modelJson.entityType];
            return new constructor(modelJson, options);
        }
    });
})();
