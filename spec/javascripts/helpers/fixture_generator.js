;(function() {
    window.newFixtures = {};
    window.fixtureData = {};
    window.newFixtures.safeExtend = safeExtend;
    window.newFixtures.addUniqueAttrs = addUniqueAttrs;

    _.each(window.fixtureDefinitions, function(definition, name) {
        var modelClass = chorus.models[definition.model];
        window.newFixtures[name] = function(overrides) {
            var rawData = getFixture(name);
            var attrs = safeExtend(rawData, overrides, name);
            addUniqueAttrs(attrs);
            return new modelClass(attrs);
        };
    });

    function getFixture(name) {
        if (!window.fixtureData[name]) {
            var $element = $("#fixtures [data-fixture-path='" + name + "']");
            if (!$element.length) throw "No fixture for " + name;
            window.fixtureData[name] = JSON.parse($element.html());
        }
        return window.fixtureData[name];
    }

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

    function safeExtend(target, source, name) {
        var result = _.clone(target);

        _.each(source, function(value, key) {
            if (target[key] === undefined) {
                if (_.isArray(target)) {
                    result[key] = value;
                    return;
                } else {
                    throw "The fixture '" + name + "' has no key '" + key + "'";
                }
            }

            if (_.isObject(target[key])) {
                result[key] = safeExtend(target[key], source[key], name + "." + key);
            } else {
                result[key] = value;
            }
        });

        return result;
    }
})();
