(function() {
    var templates = [
        'activity',
        'activity_list',
        'alert',
        'breadcrumbs',
        'browse_datasets',
        'change_password',
        'collection_picklist',
        'comment',
        'comment_list',
        'dashboard',
        'dashboard_sidebar',
        'dashboard_workspace_list',
        'dashboard_workspace_list_footer',
        'data_table',
        'database_column_sidebar_list',
        'database_column_list',
        'database_function_sidebar_list',
        'database_dataset_sidebar_list',
        'dataset_filter',
        'dataset_filter_wizard',
        'dataset_list',
        'dataset_list_sidebar',
        'dataset_preview',
        'dataset_content_details',
        'dataset_create_chorus_view_sidebar',
        'dataset_create_chorus_view_sidebar_column_row',
        'dataset_visualization_boxplot_sidebar',
        'dataset_visualization_frequency_sidebar',
        'dataset_visualization_histogram_sidebar',
        'dataset_visualization_heatmap_sidebar',
        'dataset_visualization_timeseries_sidebar',
        'default_content_header',
        'empty_data_warning',
        'header',
        'image_upload',
        'image_workfile_content',
        'instance_account',
        'instance_index_content_details',
        'instance_list',
        'instance_list_sidebar',
        'instance',
        'instances_edit',
        'instances_new',
        'instance_permissions',
        'instance_usage',
        'link_menu',
        'list_content_details',
        'loading_section',
        'logged_in_layout',
        'login',
        'main_content',
        'notes_new',
        'notes_new_file_attachment',
        'pick_workspace',
        'plain_text',
        'results_console',
        'run_file_in_schema',
        'sandbox_new',
        'schema_picker',
        'shuttle_widget',
        'sql_preview',
        'sql_workfile_content',
        'sql_workfile_content_details',
        'sub_nav',
        'tab_control',
        'text_workfile_content',
        'truncated_text',
        'user_edit',
        'user_list',
        'user_new',
        'user_show',
        'user_show_sidebar',
        'validating',
        'visualization',
        'workfile_content_details',
        'workfile_header',
        'workfile_list',
        'workfile_list_sidebar',
        'workfile_new_version',
        'workfile_show_sidebar',
        'workfile_version_list',
        'workfiles_import',
        'workfiles_sql_new',
        'workfiles_attach',
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
                        alert("The template '" + templateName + "' does not exist. You need to remove it from the spec helper, bro.");
                    }
                });
            });

            $.when.apply($, requests).done(function() {
                $("body").append(templateContainer);
                allTemplatesLoaded = true;
            });
        }
    });

    beforeEach(function() {
        loadTemplatesOnce();
        stubHotkeys();

        // loadTemplatesOnce does asynchronous ajax requests in a waitsFor
        runs(function() {
            this.server = sinon.fakeServer.create();
            chorus.router.unbind();
            delete chorus.page;
            window.qtipElements = {};

            this.renderDOM = function(content) {
                return $('#jasmine_content').html(content);
            };

            clearRenderedDOM();

            this.addMatchers({
                toBeA: function(klass) {
                    if (_.isFunction(klass)) {
                        return this.actual instanceof klass;
                    } else {
                        return (typeof this.actual === klass);
                    }
                },

                toBeEnabled: function() {
                    return this.actual.is(':not(:disabled)');
                },

                toMatchTranslation: function(translationKey) {
                    var translatedText = t.apply(this, arguments);
                    this.message = function() {
                        return [
                            "Expected text '" + this.actual + "' to match the translation for '" + translationKey + "' (" + translatedText + ")",
                            "Expected text '" + this.actual + "' not to match the translation for '" + translationKey + "' (" + translatedText + ")"
                        ];
                    };
                    if (!I18n.lookup(translationKey)) {
                        throw("No entry in messages.properties for " + translationKey);
                    }

                    return this.actual === translatedText;
                },

                toContainTranslation: function(translationKey) {
                    var actual = _.isString(this.actual) ? this.actual : this.actual.text();
                    var translatedText = t.apply(this, arguments);
                    this.message = function() {
                        return [
                            "Expected text '" + actual + "' to contain the translation for '" + translationKey + "' (" + translatedText + ")",
                            "Expected text '" + actual + "' not to contain the translation for '" + translationKey + "' (" + translatedText + ")"
                        ];
                    };
                    if (!I18n.lookup(translationKey)) {
                        throw("No entry in messages.properties for " + translationKey);
                    }

                    return this.env.contains_(actual, translatedText);
                },

                toHaveBeenCalledOnSelector: function(selector) {
                    return _.any(this.actual.calls, function(call) {
                        return call.object.selector === selector;
                    })
                },

                toHaveBeenCalledOn: function(object) {
                    return _.any(this.actual.calls, function(call) {
                        return call.object === object
                    })
                },

                toContainText: function(text) {
                    this.message = function() {
                        return [
                            'Expected "' + this.actual.text() + '" to contain "' + text + '"',
                            'Expected "' + this.actual.text() + '" not to contain "' + text + '"'
                        ];
                    }
                    return this.env.contains_(this.actual.text(), text);
                },

                toHaveBeenTriggeredOn: function(target, args) {
                    var call, eventName = this.actual;

                    if (args) {
                        this.message = function() {
                            if (call) {
                                return [
                                    "Expected event " + eventName + " to have been triggered on " + target + " with" + args + " but was triggered with " + call.args + " (did you forget to call this matcher with an array of arguments?)",
                                    "Expected event " + eventName + " not to have been triggered on " + target + " with" + args + " but was triggered with " + call.args
                                ];
                            } else {
                                return [
                                    "Expected event " + eventName + " to have been triggered on " + target + " with " + args + " but it was never triggered",
                                    "Expected event " + eventName + " not to have been triggered on " + target + " with " + args + " but it was"
                                ];
                            }
                        }
                    } else {
                        this.message = function() {
                            return [
                                "Expected event " + eventName + " to have been triggered on " + target,
                                "Expected event " + eventName + " not to have been triggered on " + target
                            ];
                        }
                    }

                    if (_.isString(target) || target instanceof jQuery) {
                        return jasmine.JQuery.events.wasTriggered(target, eventName);
                    } else if (target._chorusEventSpies && target._chorusEventSpies[eventName]) {
                        call = _.last(target._chorusEventSpies[eventName].calls);
                        if (!call) return false;
                        if (args)  return (_.isEqual(call.args, args));
                        return true;
                    } else {
                        throw "The event '" + eventName + "' has not been spied on, for the object " + target;
                    }
                },

                toMatchUrl: function(target) {
                    this.message = function() {
                        return [
                            "Expected url " + this.actual + " to be equivalent to url " + target,
                            "Expected url " + this.actual + " not to be equivalent to url " + target
                        ];
                    }

                    return (new URI(this.actual)).equals(target);
                },

                toHaveVisibleQtip: function() {
                    return this.actual.find('.qtip').attr('aria-hidden') == 'false'
                },

                toBeBetween: function(lowerBound, upperBound) {
                    return (this.actual >= lowerBound) && (this.actual <= upperBound);
                },

                toHaveBeenFetched: function() {
                    return this.spec.server.lastFetchFor(this.actual);
                }
            });

            var fakeSpinner = {
                spin: jasmine.createSpy('MockSpinner.spin').andCallFake(function(parentEl) {
                    this.el = $('<div aria-role="progressbar"/>')[0];
                    parentEl && parentEl.appendChild(this.el);
                    return this;
                }),

                stop: jasmine.createSpy('MockSpinner.stop').andCallFake(function() {
                    if (this.el) {
                        $(this.el).detach();
                    }
                })
            };

            window.Spinner = jasmine.createSpy('MockSpinner').andCallFake(function() {
                return fakeSpinner
            });

            spyOn($.fn, 'jGrowl');

            chorus.PageEvents.reset();
            chorus.session.sandboxPermissionsCreated = {};
            setLoggedInUser();
        });
    });

    afterEach(function() {
        chorus.router.trigger("leaving")
        delete chorus.models.Config._instance;
        this.server.restore();
        this.clock && this.clock.restore && this.clock.restore();
        $.cookie("userId", null)
    });

    //global helpers
    window.context = window.describe;
    window.xcontext = window.xdescribe;
    window.specify = window.it;
    window.xspecify = window.xit;

    window.xitBehavesLike = {};
    _.each(window.itBehavesLike, function(value, key) { window.xitBehavesLike[key] = $.noop });

    window.unsetLoggedInUser = function() {
        chorus.session.unset("id");
        delete chorus.session._user;
    };

    var jquerySpyOnEvent = window.spyOnEvent;
    var backboneSpyOnEvent = function(object, name) {
        var eventSpy = jasmine.createSpy(name + "Spy");
        object.bind(name, eventSpy);
        object._chorusEventSpies || (object._chorusEventSpies = {});
        object._chorusEventSpies[name] = eventSpy;
        return eventSpy;
    };

    window.spyOnEvent = function(object) {
        if (object.bind === Backbone.Events.bind) {
            return backboneSpyOnEvent.apply(this, arguments);
        } else {
            return jquerySpyOnEvent.apply(this, arguments);
        }
    }

    window.resetBackboneEventSpies = function(object) {
        if(object._chorusEventSpies) {
            _.each(object._chorusEventSpies, function(spy) {
                spy.reset();
            })
        }
    },

    window.setLoggedInUser = function(options) {
        chorus.session._user = new chorus.models.User(_.extend({
            userName: 'edcadmin'
        }, options));
        chorus.session.set({id: chorus.session._user.get('id')});
    };

    window.stubView = function(html) {
        var stubClass = Backbone.View.extend({
            initialize: function() {
                _.bindAll(this, "render")
            },

            render: function() {
                this.$(this.el).html(html)
                return this;
            }
        });

        return new stubClass
    }

    window.stubModals = function() {
        var spy = spyOn($, "facebox");
        spy.settings = {}
        return spy;
    };

    window.stubDefer = function() {
        spyOn(_, 'defer').andCallFake(function(func) {
            func();
        });
    }

    window.stubHotkeys = function() {
        spyOn(chorus.views.Bare.prototype, "bindHotkeys");
    };

    window.unstubHotkeys = function() {
        chorus.views.Bare.prototype.bindHotkeys = chorus.views.Bare.prototype.bindHotkeys.originalValue;
    };

    window.qtipElements = {};
    window.stubQtip = function(selector) {
        selector || (selector = "*");
        qtipElements[selector] = $('<div></div>');
        $('#jasmine_content').append(qtipElements[selector]);

        if (!$.fn.qtip.isSpy) {
            var qtip = $.fn.qtip;

            spyOn($.fn, 'qtip').andCallFake(function() {
                var jqueryObject = this;
                var options = arguments[0] || {};

                _.any(qtipElements, function(fakeQtipEl, selector) {
                    if (!jqueryObject.is(selector)) return false;
                    options.show || (options.show = {});
                    options.position || (options.position = {});
                    options.show.delay = 0;
                    options.position.container = fakeQtipEl;

                    qtip.call(jqueryObject, options);
                    return true;
                });
            });
        }

        return qtipElements[selector];
    }

    if ( $.browser.msie && !window['con' + 'sole'] ) {
      (function(F,i,r,e,b,u,g,L,I,T,E){if(F.getElementById(b))return;E=F[i+'NS']&&F.documentElement.namespaceURI;E=E?F[i+'NS'](E,'script'):F[i]('script');E[r]('id',b);E[r]('src',I+g+T);E[r](b,u);(F[e]('head')[0]||F[e]('body')[0]).appendChild(E);E=new Image;E[r]('src',I+L);})(document,'createElement','setAttribute','getElementsByTagName','FirebugLite','4','firebug-lite.js','releases/lite/latest/skin/xp/sprite.png','/firebug-lite/build/','#startOpened');
    }

    // Don't change urls in specs
    Backbone.History.prototype.navigate = function(fragment, triggerRoute) {
        if (triggerRoute) this.loadUrl(fragment);
    };

    //initialization
    (function safeStart() {

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

})();
