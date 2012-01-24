;
(function(ns) {
    ns.models.SchemaFunction = ns.models.Base.extend({
        toString : function() {
            var argNames = this.get('argNames');
            var functionArguments = _.map(this.get('argTypes'), function(argType, index) {
                var argName = argNames[index] || "Arg" + (index + 1);
                return argType + ' ' + argName;
            });

            var result = '"' + this.get('schemaName') + '"."' + this.get('functionName') + '"(';
            result = result + functionArguments.join(', ');
            result = result + ')';
            return result;
        }
    });
})(chorus);
