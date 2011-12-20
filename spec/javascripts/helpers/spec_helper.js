(function($) {
    var templates = [
        'activity',
        'alert',
        'breadcrumbs',
        'change_password',
        'collection_picklist',
        'comment',
        'copy_workfile',
        'dashboard',
        'dashboard_sidebar',
        'dashboard_workspace_list',
        'dashboard_workspace_list_footer',
        'default_content_header',
        'header',
        'image_upload',
        'image_workfile_content',
        'instance_list',
        'link_menu',
        'list_content_details',
        'logged_in_layout',
        'login',
        'activity_list',
        'main_content',
        'notes_new',
        'plain_text',
        'shuttle_widget',
        'sub_nav',
        'text_workfile_content',
        'truncated_text',
        'user_edit',
        'user_index_sidebar',
        'user_list',
        'user_new',
        'user_show',
        'user_show_sidebar',
        'validating',
        'workfile_content_details',
        'workfile_header',
        'workfile_list',
        'workfile_list_sidebar',
        'workfile_show_sidebar',
        'workfiles_import',
        'workfiles_sql_new',
        'workspace_detail',
        'workspace_edit_members',
        'workspace_index_content_header',
        'workspace_list',
        'workspace_members_more',
        'workspace_settings',
        'workspace_summary_sidebar',
        'workspaces_new'
    ];


    var loadTemplatesOnce = _.once(function() {
        var allTemplatesLoaded = false;

        runs(loadAllTemplates);
        waitsFor(function() {
            return allTemplatesLoaded;
        }, "all templates to be loaded", 1000);

        function loadAllTemplates() {
            var templateContainer = $("<div id='chorus_templates'/>");
            var requests = _.map(templates, function(templateName) {
                return $.ajax({
                    async: true,
                    cache: false,
                    dataType: 'html',
                    url: '/templates/' + templateName + '.handlebars',
                    success: function(data) {
                        templateContainer.append('<script id="' + templateName + '_template" type="x-handlebars-template">' + data + '</script>');
                    },
                    error: function(data) {
                        alert("The template '" + templateName + "' does not exist. You need to add it to the spec helper, bro.");
                    }
                });
            });

            $.when.apply($, requests).done(function() {
                $("body").append(templateContainer);
                allTemplatesLoaded = true;
            });
        };
    });

    beforeEach(function() {
        loadTemplatesOnce();

        // loadTemplatesOnce does asynchronous ajax requests in a waitsFor
        runs(function() {
            this.server = sinon.fakeServer.create();

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
                },

                toHaveBeenCalledOnSelector: function(selector) {
                    return this.actual.mostRecentCall.object.selector === selector;
                }
            });

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
    });

    afterEach(function() {
        this.server.restore();
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
        var spy = spyOn($, "facebox");
        spy.settings = {}
        return spy;
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
