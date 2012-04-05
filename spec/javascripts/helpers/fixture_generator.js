;(function() {
    window.newFixtures = {};
    window.newFixtures.safeExtend = safeExtend;
    window.newFixtures.addUniqueAttrs = addUniqueAttrs;

    _.each(window.fixtureDefinitions, function(definition, name) {
        var modelClass = chorus.models[definition.model];
        window.newFixtures[name] = function(overrides) {
            var attrs = safeExtend(window.fixtureData[name], overrides);
            addUniqueAttrs(attrs);
            return new modelClass(attrs);
        };
    });

    function addUniqueAttrs(attributes, keyNames) {
        _.each(attributes, function(value, key) {
            if (_.isObject(value)) {
                addUniqueAttrs(value, keyNames);
            } else {
                if (_.include(keyNames, key)) {
                    attributes[key] = _.uniqueId() + "";
                }
            }
        });
    }

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
