;(function() {
    window.newFixtures = {};
    window.fixtureData = {};
    window.newFixtures.safeExtend = safeExtend;
    window.newFixtures.addUniqueAttrs = addUniqueAttrs;

    _.each(window.fixtureDefinitions, function(definition, name) {
        var modelClass = chorus.models[definition.model];
        window.newFixtures[name] = function(overrides) {
            overrides || (overrides = {});
            var rawData = getFixture(name);
            addUniqueAttrs(overrides, definition.unique);
            var attrs = safeExtend(rawData, overrides, name);
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

    function addUniqueAttrs(attributes, keyStrings) {
        _.each(keyStrings, function(keyString) {
            var keys = keyString.split(".");
            var lastKey = keys.pop();
            var nested = attributes;
            _.each(keys, function(key) {
                nested[key] || (nested[key] = {});
                nested = nested[key];
            });
            if (nested[lastKey] === undefined) nested[lastKey] = _.uniqueId() + "";
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
