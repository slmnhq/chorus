;(function() {
    window.newFixtures = {};
    window.newFixtures.safeExtend = safeExtend;

    _.each(window.fixtureDefinitions, function(definition, name) {
        var modelClass = chorus.models[definition.model];
        window.newFixtures[name] = function(overrides) {
            return new modelClass(safeExtend(window.fixtureData[name], overrides));
        };
    });

    function safeExtend(target, source) {
        var result = _.clone(target);

        _.each(source, function(value, key) {
            if (target[key] === undefined) {
                if (_.isArray(target)) {
                    result[key] = value;
                    return;
                } else {
                    throw "Object has no key " + key + "!";
                }
            }

            if (_.isObject(target[key])) {
                result[key] = safeExtend(target[key], source[key]);
            } else {
                result[key] = value;
            }
        });

        return result;
    }
})();
