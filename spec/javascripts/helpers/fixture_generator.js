;(function() {
    window.newFixtures = {};
    window.fixtureData = {};
    window.newFixtures.safeExtend = safeExtend;
    window.newFixtures.addUniqueDefaults = addUniqueDefaults;

    _.each(window.fixtureDefinitions, function(definition, name) {
        if (definition.children) {
            window.newFixtures[name] = {};
            initializeChildDefinitions(definition);
            _.each(definition.children, function(innerDefinition, innerName) {
                generateFixture(innerDefinition, innerName, name);
            });
        } else {
            generateFixture(definition, name);
        }
    });

    function initializeChildDefinitions(definition) {
        _.each(definition.children, function(childDef) {
            _.each(definition, function(value, property) {
                if (property === "children") { return };
                childDef[property] || (childDef[property] = definition[property]);
            });
        });
    }

    function generateFixture(definition, name, parentName) {
        var module = parentName ? newFixtures[parentName] : newFixtures;
        var klass = getClass(definition, parentName || name);
        var jsonMethodName = name + "Json";

        module[name] = function(overrides) {
            var result = new klass();
            var rawData = result.parse(getFixture(name, parentName));
            overrides || (overrides = defaultOverridesFor(rawData));
            addUniqueDefaults(overrides, definition.unique);
            var attrs = safeExtend(rawData, overrides, name);
            addDerivedAttributes(attrs, overrides, definition.derived);

            var setMethod = (result instanceof chorus.collections.Base) ? "reset" : "set";
            return result[setMethod](attrs, { silent: true });
        };

        module[jsonMethodName] = function() {
            return module[name].apply(this, arguments).attributes;
        };
    }

    function addDerivedAttributes(attrs, overrides, derivationMethods) {
        _.each(derivationMethods, function(method, attrName) {
            if (!overrides[attrName]) {
                attrs[attrName] = method(attrs);
            }
        });
    }

    function getClass(definition, name) {
        if (definition.model) {
            return chorus.models[definition.model];
        } else if (definition.collection) {
            return chorus.collections[definition.collection];
        } else {
            var isCollection = name.match(/Set/);
            var className = _.titleize(name);
            return (isCollection ? chorus.collections[className] : chorus.models[className]) || chorus.models.Base;
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
