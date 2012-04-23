chorus.Mixins.dbHelpers = {
    safePGName: function() {
        function encode(name) {
            var isSafe = name.match(chorus.ValidationRegexes.SafePgName());
            return isSafe ? name : '"' + name + '"';
        }

        return _.map(arguments, function(arg) {
            return encode(arg)
        }).join('.')
    },

    sqlEscapeString: function(string) {
        return string.replace(/'/g, "''");
    }
};
