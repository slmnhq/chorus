chorus.models.SchemaFunction = chorus.models.Base.extend({
    constructorName: "SchemaFunction",
    toText: function() {
        var argNames = this.get('argNames');
        var functionArguments = this.getFunctionArguments();

        var schemaName = this.safePGName(this.get("schemaName"));
        var functionName = this.safePGName(this.get("functionName"));

        var result = schemaName + "." + functionName + '(';
        result = result + functionArguments.join(', ');
        result = result + ')';
        return result;
    },

    toHintText: function() {
        return this.get("returnType") + " " + this.get('functionName') + this.formattedArgumentList(true);
    },

    getFunctionArguments: function() {
        var argNames = this.get('argNames');
        var functionArguments = _.map(this.get('argTypes'), function(argType, index) {
            var argName = argNames[index] || "arg" + (index + 1);
            return argType + ' ' + argName;
        });

        return functionArguments
    },

    formattedArgumentList: function(ensureParams) {
        var args = this.getFunctionArguments();
        if (ensureParams || args.length > 0) {
            return "(" + args.join(", ") + ")";
        } else {
            return "";
        }
    },

    definition:function () {
        return this.get("functionDefinition");
    }
});