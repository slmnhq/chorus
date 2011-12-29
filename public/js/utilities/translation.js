;(function($, ns) {
    ns.translation = {
        parseProperties: function(propertiesString) {
            var lineJoiningRegex = /\\\s*\n/g;
            var joinedLines = propertiesString.replace(lineJoiningRegex, '').split("\n");

            var result = {};
            _.each(joinedLines, function(line) {
                var match = line.split("=");
                if (match.length < 2) return;
                if (match[0].match(/^\s*#/)) return;
                var keys = match[0].split("."),
                    val = _.rest(match).join("=");
                var innerHash = _.reduce(_.initial(keys), function(hash, key) {
                    return hash[key] || (hash[key] = {});
                }, result)
                innerHash[_.last(keys)] = val;
            });

            return result;
        }
    };

    $.ajax({
        url: '/messages/Messages_en.properties',
        async: false,
        dataType: 'text'
    }).done(function(data, status) {
        I18n.translations = {};
        I18n.translations[ns.locale] = ns.translation.parseProperties(data);
    });
})(jQuery, chorus);
