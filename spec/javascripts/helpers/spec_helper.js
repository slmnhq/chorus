(function($) {
    beforeEach(function() {
        this.server = sinon.fakeServer.create();

        this.spies = sinon.sandbox.create();
        this.loadTemplate = function(templateName) {
            this.server.restore();
            loadFixtures(templateName + '.handlebars');
            this.server = sinon.fakeServer.create();
        };

        this.renderDOM = function(content) {
            return $('#jasmine_content').html(content);
        };

        clearRenderedDOM();
    });

    afterEach(function() {
        this.server.restore();
        this.spies.restore();
    });

    function clearRenderedDOM() {
        $('#jasmine_content').empty();
    }
})(jQuery);
