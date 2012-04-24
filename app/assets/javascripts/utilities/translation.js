chorus.translation = {
    parseProperties:function (propertiesString) {
        var lineJoiningRegex = /\\\s*\n/g;
        var joinedLines = propertiesString.replace(lineJoiningRegex, '').split("\n");

        var result = {};
        _.each(joinedLines, function (line) {
            var match = line.split("=");
            if (match.length < 2) return;
            if (match[0].match(/^\s*#/)) return;
            var keys = match[0].split("."),
                val = _.rest(match).join("=");
            var innerHash = _.reduce(_.initial(keys), function (hash, key) {
                return hash[key] || (hash[key] = {});
            }, result)
            if (innerHash[_.last(keys)] != undefined || !_.isObject(innerHash)) {
                alert("Translation: " + line + " is a collision with an existing translation");
            }
            innerHash[_.last(keys)] = val;
        });

        return result;
    },

    getMessageFileUrl: function() {
        return '../../messages/Messages_en.properties?iebuster=' + $.now();
    }
};

$.ajax({
    url:chorus.translation.getMessageFileUrl(),
    async:false,
    dataType:'text'
}).done(function (data, status) {
        I18n.translations = {};
        I18n.translations[chorus.locale] = chorus.translation.parseProperties(data);
});