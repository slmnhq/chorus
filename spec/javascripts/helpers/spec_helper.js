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
                var translatedText = t.apply(this, arguments);
                if (translatedText === '[' + translationKey + ']') {
                    throw("No entry in messages.properties for " + translationKey);
                }

                return this.actual === translatedText;
            }
        })

        var fakeSpinner = {
            spin : jasmine.createSpy('MockSpinner.spin').andCallFake(function(parentEl) {
                this.el = $('<div aria-role="progressbar"/>')[0];
                parentEl && parentEl.appendChild(this.el);
                return this;
            }),

            stop : jasmine.createSpy('MockSpinner.stop').andCallFake(function() {
                if (this.el) {
                    $(this.el).detach();
                }
            })
        };

        window.Spinner = jasmine.createSpy('MockSpinner').andCallFake(function() {
            return fakeSpinner
        });

        setLoggedInUser();
    });

    afterEach(function() {
        this.server.restore();
        this.spies.restore();
        $.cookie("userId", null)
    });

    //global helpers
    window.context = window.describe;

    window.unsetLoggedInUser = function() {
        chorus.session.unset("id");
        delete chorus.session._user;
    };

    window.setLoggedInUser = function(options) {
        options || (options = {});
        chorus.session.set({ id: options.id || "10000" });
        chorus.session._user = new chorus.models.User({
            "firstName" : "Luther",
            "lastName" : "Blissett",
            "fullName": "Luther Blissett",
            "admin" : !!options['admin'],
            "userName" : options['userName'] || "edcadmin",
            "id" : options['id'] || "10000"
        });
    };

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
    };

    if ( $.browser.msie && !window.console ) {
      (function(F,i,r,e,b,u,g,L,I,T,E){if(F.getElementById(b))return;E=F[i+'NS']&&F.documentElement.namespaceURI;E=E?F[i+'NS'](E,'script'):F[i]('script');E[r]('id',b);E[r]('src',I+g+T);E[r](b,u);(F[e]('head')[0]||F[e]('body')[0]).appendChild(E);E=new Image;E[r]('src',I+L);})(document,'createElement','setAttribute','getElementsByTagName','FirebugLite','4','firebug-lite.js','releases/lite/latest/skin/xp/sprite.png','/firebug-lite/build/','#startOpened');
    }

    // Don't change urls in specs
    Backbone.History.prototype.navigate = function(fragment, triggerRoute) {
        if (triggerRoute) this.loadUrl(fragment);
    };

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
