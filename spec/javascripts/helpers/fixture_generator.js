;(function() {
    window.newFixtures = {};
    window.fixtureData = {};
    window.newFixtures.safeExtend = safeExtend;
    window.newFixtures.addUniqueDefaults = addUniqueDefaults;

    _.each(window.fixtureDefinitions, function(definition, name) {
        var klass = getClass(definition);
        var jsonMethodName = name + "Json";

        window.newFixtures[jsonMethodName] = function(overrides, uncheckedOverrides) {
            var rawData = getFixture(name);
            overrides || (overrides = defaultOverridesFor(rawData));
            addUniqueDefaults(overrides, definition.unique);
            var safeAttrs = safeExtend(rawData, overrides, name);
            return _.extend(safeAttrs, uncheckedOverrides);
        };

        window.newFixtures[name] = function() {
            var attrs = newFixtures[jsonMethodName].apply(this, arguments);
            return new klass(attrs);
        };
    });

    function getClass(fixtureDefinition) {
        if (fixtureDefinition.model) {
            return chorus.models[fixtureDefinition.model];
        } else {
            return chorus.collections[fixtureDefinition.collection];
        }
    }

    function defaultOverridesFor(rawData) {
        if (_.isArray(rawData)) {
            return _.map(rawData, function() { return {}; });
        } else {
            return {};
        }
    }

    function getFixture(name) {
        if (!window.fixtureData[name]) {
            var $element = $("#fixtures [data-fixture-path='" + name + "']");
            if (!$element.length) throw "No fixture for " + name;
            window.fixtureData[name] = JSON.parse($element.html());
        }
        return window.fixtureData[name];
    }

    function addUniqueDefaults(attributeObjects, keyStrings) {
        if (!_.isArray(attributeObjects)) attributeObjects = [attributeObjects];
        _.each(keyStrings, function(keyString) {
            var keys = keyString.split(".");
            var lastKey = keys.pop();

            _.each(attributeObjects, function(attributeObject) {
                var nested = attributeObject;
                _.each(keys, function(key) {
                    nested[key] || (nested[key] = {});
                    nested = nested[key];
                });
                if (nested[lastKey] === undefined) nested[lastKey] = _.uniqueId() + "";
            });
        });
    }

    function safeExtend(original, overrides, name) {
        var result = _.isArray(original) ? [] : _.clone(original);

        _.each(overrides, function(value, key) {
            if (original[key] === undefined) {
                if (_.isArray(original)) {
                    result[key] = value;
                    return;
                } else {
                    throw "The fixture '" + name + "' has no key '" + key + "'";
                }
            }

            if (_.isObject(original[key])) {
                result[key] = safeExtend(original[key], overrides[key], name + "." + key);
            } else {
                result[key] = value;
            }
        });

        return result;
    }
})();
