(function() {
    var loadTemplatesOnce = _.once(function() {
        var allTemplatesLoaded = false;

        // Code that only needs to be run once before all the tests run
        _.debounce = function(func) { return func; }

        $(window).focus(function(){
            jasmine.getEnv().updateInterval = jasmine.DEFAULT_UPDATE_INTERVAL;
        });

        $(window).blur(function() {
            // if you get 'unresponsive script' warnings in Firefox, you can override the dom.max_script_time variable
            jasmine.getEnv().updateInterval = 12000;
        });

        runs(loadAllTemplates);
        waitsFor(function() {
            return allTemplatesLoaded;
        }, "all templates to be loaded", 5000);

        function loadAllTemplates() {
            var templateContainer = $("<div id='chorus_templates'/>");
            $("body").append(templateContainer);
            return $.ajax({
                async: false,
                cache: false,
                dataType: 'html',
                url: '/__templates',
                success: function(data) {
                    templateContainer.append(data);
                    allTemplatesLoaded = true;
                },
                error: function(data) {
                    alert("Sorry but I couldn't load the templates! Things will go REALLY poorly from here...");
                    allTemplatesLoaded = true;
                }
            });
        }
    });

    beforeEach(function() {
        loadTemplatesOnce();
        stubHotkeys();

        var regexEqualityTester = function(a, b) {
            if(a instanceof RegExp && b instanceof RegExp) {
                return a.toString() === b.toString();
            }
        }
        jasmine.getEnv().addEqualityTester(regexEqualityTester);

        // loadTemplatesOnce does asynchronous ajax requests in a waitsFor
        runs(function() {
            this.server = sinon.fakeServer.create();
            chorus.router.unbind();
            delete chorus.page;
            window.qtipElements = {};

            this.renderDOM = function(content) {
                return $('#jasmine_content').html(content);
            };

            this.showInJasmine = function(el) {
                var $j = $("#jasmine_content");
                var originalRight = $j.css("right");

                $j.css("right", 0).append(el);
                this.after(function() {
                    $j.css("right", originalRight);
                });
            }

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
                    var actualText = _.isString(this.actual) ? this.actual : this.actual.text()
                    this.message = function() {
                        return [
                            'Expected "' + actualText + '" to contain "' + text + '"',
                            'Expected "' + actualText + '" not to contain "' + text + '"'
                        ];
                    }
                    return this.env.contains_(actualText, text);
                },

                toHaveSpinner: function() {
                    this.message = function() {
                        return [
                            'Expected "' + this.actual.selector + '" to have a spinner',
                            'Expected "' + this.actual.selector + '" not to have a spinner'
                        ]
                    }
                    return this.actual.find("div[aria-role=progressbar]").length
                },

                toHaveModal: function(modalClass) {
                    if (!modalClass) { throw "expected undefined modal class to have been launched."; }
                    var modalClassName = modalClass.prototype.className;
                    this.message = function() {
                        return [
                            'Expected to have a modal with class ' + modalClassName,
                            'Expected not to have a modal with class ' + modalClassName
                        ]
                    }
                    return this.actual.mostRecentCall && this.actual.mostRecentCall.args && this.actual.mostRecentCall.args[0] && $(this.actual.mostRecentCall.args[0]).hasClass(modalClassName);
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

                toMatchUrl: function(target, options) {
                    this.message = function() {
                        return [
                            "Expected url " + this.actual + " to be equivalent to url " + target,
                            "Expected url " + this.actual + " not to be equivalent to url " + target
                        ];
                    }

                    var paramsToIgnore = (options && options.paramsToIgnore) || [];
                    var targetURI = new URI(decodeURI(target)).removeSearch(paramsToIgnore);
                    var actualURI = new URI(decodeURI(this.actual)).removeSearch(paramsToIgnore);
                    return (actualURI).equals(targetURI);
                },

                toContainQueryParams: function(queryParams) {
                    var actualQueryParams = new URI(this.actual).query(true);
                    var targetQueryParams = new URI("").addSearch(queryParams).query(true);

                    return _.all(targetQueryParams, function(targetValue, targetKey) {
                        return actualQueryParams[targetKey] === targetValue;
                    });
                },

                toHaveUrlPath: function(targetPath) {
                    var actualURI = new URI(this.actual);
                    return actualURI.path() === targetPath;
                },

                toHaveHref: function(expectedHref) {
                    var actualHref = this.actual.attr("href")
                    this.message = function() {
                        return [
                            "Expected href " + actualHref + " to be an `a` and equivalent to href " + expectedHref,
                            "Expected href " + actualHref + " to be an `a` and not to be equivalent to href " + expectedHref
                        ];
                    }
                    return this.actual.is("a") && decodeURI(actualHref) === decodeURI(expectedHref);
                },

                toHaveVisibleQtip: function() {
                    return this.actual.find('.qtip').attr('aria-hidden') == 'false'
                },

                toBeBetween: function(lowerBound, upperBound) {
                    return (this.actual >= lowerBound) && (this.actual <= upperBound);
                },

                toHaveBeenFetched: function() {
                    return !!this.spec.server.lastFetchFor(this.actual);
                },

                toHaveBeenCreated: function() {
                    return !!this.spec.server.lastCreateFor(this.actual);
                },

                toHaveBeenUpdated: function() {
                    return !!this.spec.server.lastUpdateFor(this.actual);
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

            $.fx.off = true;
            spyOn($.fn, 'jGrowl');
            spyOn(window.history, "back");
            spyOn(chorus, 'isDevMode').andReturn(false);

            chorus.PageEvents.reset();
            chorus.session.sandboxPermissionsCreated = {};
            setLoggedInUser();
        });
    });

    var specWhitelist = {
        id: true,
        env: true,
        suite: true,
        description: true,
        queue: true,
        afterCallbacks: true,
        spies_: true,
        results_: true,
        matchersClass: true
    };

    afterEach(function() {
        chorus.router.trigger("leaving")
        delete chorus.models.Config._instance;
        this.server.restore();
        this.clock && this.clock.restore && this.clock.restore();
        $.cookie("userId", null)
        if (this instanceof jasmine.Spec) {
            // reduce the number of keys to iterate
            var oldProto = this.prototype;
            delete this.prototype;

            _.each(this, function(_value, key) {
                if (this.hasOwnProperty(key) && !(key in specWhitelist)) {
                    delete this[key];
                }
            }, this);

            this.prototype = oldProto;
        }
        chorus._navigated();
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
        if (object._chorusEventSpies) {
            _.each(object._chorusEventSpies, function(spy) {
                spy.reset();
            })
        }
    };

    window.setLoggedInUser = function(options, chorusInstance) {
        var target = (chorusInstance || chorus);
        target.session._user = new chorus.models.User(_.extend({
            userName: 'edcadmin',
            id: "10000"
        }, options));
        target.session.set({id: target.session._user.get('id')});
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

    window.stubDelay = function() {
        spyOn(_, 'delay').andCallFake(function(func) {
            func();
        });
    }

    window.stubSetTimeout = function() {
        spyOn(window, 'setTimeout').andCallFake(function(func) {
            func();
        });
    }

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
                if (typeof options !== 'object') return;

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

    window.stubSelectMenu = function() {
        var stubContainer = $('<div class="selectMenuStub"></div>');
        $('#jasmine_content').append(stubContainer);

        var selectmenu = $.fn.selectmenu;

        spyOn($.fn, 'selectmenu').andCallFake(function() {
            var jqueryObject = this;
            var options = arguments[0] || {};
            options.appendTo = stubContainer;
            selectmenu.call(jqueryObject, options);
            return true;
        });

        return stubContainer;
    }

    if ($.browser.msie && !window['con' + 'sole']) {
        (function(F, i, r, e, b, u, g, L, I, T, E) {
            if (F.getElementById(b))return;
            E = F[i + 'NS'] && F.documentElement.namespaceURI;
            E = E ? F[i + 'NS'](E, 'script') : F[i]('script');
            E[r]('id', b);
            E[r]('src', I + g + T);
            E[r](b, u);
            (F[e]('head')[0] || F[e]('body')[0]).appendChild(E);
            E = new Image;
            E[r]('src', I + L);
        })(document, 'createElement', 'setAttribute', 'getElementsByTagName', 'FirebugLite', '4', 'firebug-lite.js', 'releases/lite/latest/skin/xp/sprite.png', '/firebug-lite/build/', '#startOpened');
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

    if (window.location.search.indexOf("profile=") != -1) {
        jasmine.getEnv().addReporter(new jasmine.ProfileReporter())
    }
})();
