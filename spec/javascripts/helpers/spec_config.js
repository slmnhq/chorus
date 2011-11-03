(function($) {
    // patches jasmine-jquery fixture loading to use our handlebars templates
    // -----------------------------------------------------------------------
    jasmine.getFixtures = function() {
        var result = jasmine.currentFixtures_ = jasmine.currentFixtures_ || new jasmine.Fixtures();
        result.fixturesPath = "templates";

        return result;
    };

    jasmine.Fixtures.prototype.load = function(fixtureName) {
      this.createContainer_(fixtureName, this.read(fixtureName));
    };

    jasmine.Fixtures.prototype.createContainer_ = function(name, html) {
        var templateId = name.replace('.handlebars', '_template');

        this.containerId = templateId;
        this.cleanUp();

        //TODO: Figure out why this doesn't work in Firefox
//        var template   = jQuery('<script id="' + templateId + '" type="x-handlebars-template" />').html(html);
//        jQuery('body').append(template);
        jQuery('body').append('<script id="' + templateId + '" type="x-handlebars-template">' + html + '</script>');

    };
})(jQuery);
