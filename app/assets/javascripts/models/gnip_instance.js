chorus.models.GnipInstance = chorus.models.Instance.extend({
    constructorName: "GnipInstance",
    urlTemplate: "gnip_instances/{{id}}",
    showUrlTemplate: "gnip_instances/{{id}}",
    shared: true,
    entityType: "gnip_instance",

    providerIconUrl: function() {
        return this._imagePrefix + "gnip.png"
    },

    isShared: function() {
        return true;
    },

    isGnip: function() {
        return true;
    },

    declareValidations: function(newAttrs) {
        this.require("name", newAttrs);
        this.requirePattern("name", chorus.ValidationRegexes.ChorusIdentifier(), newAttrs, "instance.validation.name_pattern");
        this.requirePattern("name", chorus.ValidationRegexes.ChorusIdentifier(44), newAttrs);
        this.require("host", newAttrs);
        this.require("port", newAttrs);
        this.requirePattern("port", chorus.ValidationRegexes.OnlyDigits(), newAttrs);
        this.require("username", newAttrs);
        this.require("password", newAttrs);
    },

    sharedAccountDetails: function() {
        return this.get("username");
    }

});
