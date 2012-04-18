;(function() {
    window.newFixtures = {};
    window.fixtureData = {};
    window.newFixtures.safeExtend = safeExtend;
    window.newFixtures.addUniqueDefaults = addUniqueDefaults;

    _.each(window.fixtureDefinitions, function(definition, name) {
        if (definition.model || definition.collection) {
            generateFixture(definition, name);
        } else {
            newFixtures[name] = {};
            _.each(definition, function(innerDefinition, innerName) {
                generateFixture(innerDefinition, innerName, name);
            });
        }
    });

    function generateFixture(definition, name, parentName) {
        var module = parentName ? newFixtures[parentName] : newFixtures;
        var klass = getClass(definition);
        var jsonMethodName = name + "Json";

        module[jsonMethodName] = function(overrides, uncheckedOverrides) {
            var rawData = getFixture(name, parentName);
            overrides || (overrides = defaultOverridesFor(rawData));
            addUniqueDefaults(overrides, definition.unique);
            var attrs = safeExtend(rawData, overrides, name);
            _.extend(attrs, uncheckedOverrides);
            addDerivedAttributes(attrs, overrides, definition.derived);
            return attrs;
        };

        module[name] = function() {
            var attrs = module[jsonMethodName].apply(this, arguments);
            return new klass(attrs);
        };
    }

    function addDerivedAttributes(attrs, overrides, derivationMethods) {
        _.each(derivationMethods, function(method, attrName) {
            if (!overrides[attrName]) {
                attrs[attrName] = method(attrs);
            }
        });
    }

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

    function getFixture(name, parentName) {
        if (!window.fixtureData[name]) {
            var path = _.compact([parentName, name]).join("/");
            var $element = $("#fixtures [data-fixture-path='" + path + "']");
            if (!$element.length) throw "No fixture for " + path;
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
