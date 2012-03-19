window.Chorus = function chorus$Global() {
    var self = this;
    self.models = {};
    self.views = {};
    self.pages = {};
    self.presenters = {};
    self.dialogs = {};
    self.alerts = {};
    self.templates = {};
    self.features = {};
    self.utilities = {};
    self.locale = 'en';
    self.cleanupFunctions = [];

    self.initialize = function() {
        // Check and prompt for Chrome Frame install if applicable
        if (!window.jasmine && BrowserDetect.browser == "Explorer" && BrowserDetect.version <= "8") {
            CFInstall.check({
                mode: "overlay"
            });
        }
        self.workfileDir = "ofbiz/runtime/data/workfile";
        self.PageEvents = new chorus.utilities.PageEvents();
        self.session = new chorus.models.Session();
        self.router = new chorus.Router(self);
        self.detectFeatures();

        //bind global state events here
        self.router.bind("leaving", self._navigated);
        self.session.bind("needsLogin", self.requireLogin);
        self.bindGlobalCallbacks();
        self.bindModalLaunchingClicks();

        self.startHistory();
    };

    // to enable development mode, create the following file:
    //   public/js/environment.js
    // it should contain the following line:
    //   window.CHORUS_DEV_MODE = true;
    self.isDevMode = function() {
        return !!window.CHORUS_DEV_MODE;
    };

    self.bindGlobalCallbacks = function() {
        $(window).resize(_.debounce(function() {
            self.page && self.page.trigger && self.page.trigger("resized");
        }, 100));
    }

    self.bindModalLaunchingClicks = function() {
        var firstArg = arguments[0];
        var target = arguments.length ? firstArg.el : document;
        $(target).
            on("click.chorus_modal", "button.dialog, a.dialog", null,
            function(e) { (firstArg || self.page).createDialog(e); }).
            on("click.chorus_modal", "button.alert, a.alert", null,
            function(e) { (firstArg || self.page).createAlert(e); }).
            on("click.chorus_modal", "#help a", null, function(e) { (firstArg || self.page).showHelp(e); });

        if (window.jasmine) {
            var spec = window.jasmine.getEnv().currentSpec;
            spec && spec.after(function() {$(target).off("click.chorus_modal"); });
        }
    };

    self.startHistory = function() {
        Backbone.history.start();
    };

    self.requireLogin = function requireLogin() {
        if(Backbone.history.fragment != "/logout") {
            self.session.pathBeforeLoggedOut = Backbone.history.fragment;
            self.session.previousUserId = self.session.get("user") ? self.session.get("user").id : undefined;

        } else {
            delete self.session.pathBeforeLoggedOut;
            delete self.session.previousUserId;
        }

        self.router.navigate("/login", true);
    };

    self.detectFeatures = function() {
        self.features.fileProgress = !$.browser.msie;
    }

    self.toast = function(message, options) {
        options = options || {};
        var defaultOpts = {sticky: false, life: 5000};
        var toastOpts = _.extend(defaultOpts, options.toastOpts);
        $.jGrowl(t(message, options), toastOpts);
    }

    self.afterNavigate = function(func) {
        self.cleanupFunctions.push(func);
    }

    self._navigated = function() {
        self.PageEvents.reset();

        _.each(self.cleanupFunctions, function(func) {
            func();
        });

        self.cleanupFunctions = [];
    }

    self.menu = function(menuElement, options) {
        self.afterNavigate(function() {$(menuElement).remove();});

        options = options || {};
        var classes = ((options.classes || "") + " tooltip-white").trim();
        if (menuElement.length) {
            if ($(menuElement).closest(".dialog").length) {
                classes += " tooltip-modal";
            }
        }

        var qtipArgs = {
            content: options.content,
            show: {
                event: 'click',
                delay: 0
            },
            hide: 'unfocus',
            position: {
                container: options.container,
                my: "top center",
                at: "bottom center"
            },
            style: {
                classes: classes,
                tip: {
                    mimic: options.mimic || "top center",
                    width: 20,
                    height: 15
                }
            }
        };

        _.extend(qtipArgs, options.qtipArgs);

        if(options.position) {
            _.extend(qtipArgs.position, options.position)
        }

        if (options.orientation === "right") {
            qtipArgs.position.my = "top left";
            qtipArgs.style.tip.offset = 40;
        } else if (options.orientation === "left") {
            qtipArgs.position.my = "top right";
            qtipArgs.style.tip.offset = 40;
        }

        if (options.contentEvents) {
            qtipArgs.events = {};
            qtipArgs.events.render = function(event, api) {
                _.each(options.contentEvents, function(callback, selector) {
                    var wrappedCallback = function(event) {
                        event.preventDefault();
                        event.stopPropagation();
                        callback(event, api);
                        api.hide();
                    }
                    $(api.elements.content).find(selector).click(wrappedCallback);
                })
            };
        }

        menuElement.click(function(e) {
            e.preventDefault();
        });

        menuElement.qtip(qtipArgs);
    }

    self.styleSelect = function(element, options) {
        var $element = $(element);
        if ($element.data('selectmenu')) {$element.selectmenu("destroy");}

        var changeFunction = function() {
            $(element).trigger('change');
        }
        var newOptions = _.extend({}, options, {change: changeFunction, positionOptions: {offset: "0 -1"}})
        $element.selectmenu(newOptions);
    }

    self.datePicker = function(selectors, options) {
        var formElementParams = {};

        _.each(selectors, function(el, format) {
            var uniqueId = _.uniqueId("date-picker");
            el.attr("id", uniqueId);
            formElementParams[uniqueId] = format;
        });

        _.defer(function() {
            datePickerController.createDatePicker({
                formElements: formElementParams,
                dragDisabled: true,
                callbackFunctions: {
                    "datereturned": [], // documented but never fires, so we do the following _.defer instead
                    "dateset": [
                        function() {
                            _.defer(function() {
                                for (formElement in formElementParams) {
                                    $("#" + formElement).trigger("paste");
                                }
                            })
                        }
                    ]
                }
            });

            options && options.disableBeforeToday && _.each(formElementParams, function(v, k) {
                datePickerController.setDisabledDates(k, {
                  "00000101" : new Date($.now() - (1000  * 60 * 60 * 24)).toString("yyyyMMdd")
                });
            });
        });
    };

    self.placeholder = function(element) {
        $(element).placeholder();
    };

    self.search = function(options) {
        var input = options.input,
            list = options.list,
            selector = options.selector;

        input.unbind("textchange").bind("textchange", _.bind(onTextChange, this, options));
        input.addClass("chorus_search")
        input.each(function(i, el) {
            var $el = $(el);
            var clearLink = $("<a href='#'/>")
                .addClass("chorus_search_clear hidden")
                .append("<img src='/images/icon_clear_search.png'></a>")
                .bind('click', function(e) {
                    e.preventDefault();
                    $el.val("").trigger('textchange').blur();
                });

            var container = $("<div class='chorus_search_container'></div>");
            container.css({ display: $el.css("display") });
            container.insertAfter(el);
            container.append(el).append(clearLink);
        });
    };

    function onTextChange(options, e) {
        var list = options.list,
            selector = options.selector,
            onFilter = options.onFilter,
            afterFilter = options.afterFilter,
            changedInput = $(e.target),
            clearLink = changedInput.siblings(".chorus_search_clear");

        var compare = changedInput.val().toLowerCase();
        clearLink.toggleClass("hidden", compare.length === 0);
        list.find("li").each(function() {
            var elToMatch = selector ? $(this).find(selector) : $(this);
            var matches = (elToMatch.text().toLowerCase().indexOf(compare) >= 0);

            if (matches) {
                $(this).removeClass("hidden");
            } else {
                if (onFilter && !$(this).hasClass("hidden")) onFilter($(this));
                $(this).addClass("hidden");
            }
        });

        if (afterFilter) afterFilter();
    }

    self.hotKeyMeta = BrowserDetect.OS == "Mac" ? "ctrl" : "alt";

    self.hotKeyEvent = function(keyChar) {
        var ev = $.Event("keydown", { which: keyChar.toUpperCase().charCodeAt(0)});
        if (chorus.hotKeyMeta == "ctrl") {
            ev.ctrlKey = true;
        } else if (chorus.hotKeyMeta == "alt") {
            ev.altKey = true;
        }

        return ev;
    }

    self.triggerHotKey = function(keyChar) {
        $(document).trigger(chorus.hotKeyEvent(keyChar))
    }

    self.help = function() {
        var helpId = (chorus.page && chorus.page.helpId) || "home";
        FMCOpenHelp(helpId);
    }

    self.namedConstructor = function(ctor, name) {
        return eval("(function " + name + "() { " +
            "return ctor.apply(this, arguments); " +
        "})");
    };

    if (self.isDevMode()) {
        self.classExtend = function(protoProps, classProps) {
            var constructorName = protoProps.constructorName || this.prototype.constructorName;
            if (constructorName) {
                _.extend(protoProps, { constructor: self.namedConstructor(this, "chorus$" + constructorName) });
            }
            return Backbone.Model.extend.call(this, protoProps, classProps);
        }
    } else {
        self.classExtend = Backbone.Model.extend;
    }

    self.log = function() {
        var grossHack = window["con"+"sole"];
        if (grossHack) {
            if (grossHack.groupCollapsed && grossHack.groupEnd) {
                grossHack.groupCollapsed.apply(grossHack, ["Chorus Log: "].concat(_.toArray(arguments)));
            }

            grossHack.log && grossHack.log.apply(grossHack, _.toArray(arguments));
            grossHack.trace && grossHack.trace();

            if (grossHack.groupCollapsed && grossHack.groupEnd) {
                grossHack.groupEnd();
            }
        }
    }
}

window.chorus = window.chorus || new Chorus();

