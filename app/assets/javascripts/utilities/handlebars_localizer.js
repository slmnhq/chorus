Handlebars.registerHelper("t", function(key) {
    if(arguments[arguments.length - 1].hash) {
        arguments[arguments.length - 1] = arguments[arguments.length - 1].hash;
    }
    return t.apply(this, arguments);
});