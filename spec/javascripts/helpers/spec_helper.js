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

        this.addMatchers({
            toMatchTranslation: function(translationKey) {
                this.message = function() {
                    return [
                        "Expected text '" + this.actual + "' to match the translation for '" + translationKey + "'",
                        "Expected text '" + this.actual + "' not to match the translation for '" + translationKey + "'"
                    ];
                };

                var translatedText = t(translationKey);
                if (translatedText === '[' + translationKey + ']') {
                    throw("No entry in messages.properties for " + translationKey);
                }

                return this.actual === translatedText;
            }
        })

    });

    afterEach(function() {
        this.server.restore();
        this.spies.restore();
        $.cookie("userId", null)
    });

    //global helpers
    window.context = window.describe;

    window.setLoggedInUser = function(options) {
        chorus.user = new chorus.models.User({
            "firstName" : "Luther",
            "lastName" : "Blissett",
            "fullName": "Luther Blissett",
            "admin" : !!options['admin'],
            "userName" : options['userName'] || "edcadmin",
            "id" : options['id'] || "10000"
        });
    }

    window.stubView = function(html) {
        var stubClass = Backbone.View.extend({
            initialize : function() {
                _.bindAll(this, "render")
            },

            render :  function() {
                this.$(this.el).html(html)
                return this;
            }
        });

        return new stubClass
    }

    window.stubModals = function(){
        return spyOn($, "facebox") 
    }


    //initialization
    ;(function safeStart() {

        var origLogin = chorus.requireLogin;
        var origHistory = chorus.startHistory;
        chorus.requireLogin = $.noop;
        chorus.startHistory = $.noop;

        chorus.initialize();

        chorus.requireLogin = origLogin;
        chorus.startHistory = origHistory;

    })();

    function clearRenderedDOM() {
        $('#jasmine_content').empty();
    }

})(jQuery);
