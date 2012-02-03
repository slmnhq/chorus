window.Chorus = function() {
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

    self.initialize = function() {
        // Check and prompt for Chrome Frame install if applicable
        window.jasmine || CFInstall.check({
            mode: "overlay"
        });

        self.session = new chorus.models.Session();
        self.router = new chorus.Router(self);
        self.detectFeatures();

        //bind global state events here
        self.session.bind("needsLogin", self.requireLogin);

        self.startHistory();
    };

    self.startHistory = function() {
        Backbone.history.start();
    };

    self.requireLogin = function requireLogin() {
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

    self.menu = function(menuElement, options) {
        var qtipArgs = {
            content: options.content,
            show: {
                event: 'click'
            },
            hide: 'unfocus',
            position: {
                container: options.container,
                my: "top center",
                at: "bottom center"
            },
            style: {
                classes: "tooltip-white",
                tip: {
                    mimic: "top center",
                    width: 20,
                    height: 15
                }
            }
        };

        if (options.orientation === "right") {
            qtipArgs.position.my = "top left";
            qtipArgs.style.tip.offset = 40;
        } else if (options.orientation === "left") {
            qtipArgs.position.my = "top right";
            qtipArgs.style.tip.offset = 40;
        }

        if(options.contentEvents) {
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
        if($element.data('selectmenu')){$element.selectmenu("destroy");}

        var changeFunction = function() {
            $(element).trigger('change');
        }
        $element.selectmenu({change: changeFunction, position: {offset: "0 -1"}});
    }

    self.placeholder = function(element) {
        $(element).placeholder();
    };

    self.search = function(options) {
        var input = options.input,
            list = options.list,
            selector = options.selector;
        input.unbind("textchange").bind("textchange", _.bind(filterSearchList, this, input, list, selector));
    }

    function filterSearchList(input, list, selector) {
        var compare = input.val().toLowerCase();
        list.find("li").each(function() {
            var elToMatch = selector ? $(this).find(selector) : $(this);
            var matches = (elToMatch.text().toLowerCase().indexOf(compare) >= 0);
            $(this).toggleClass("hidden", !matches);
        });
    }

    self.hotKeyMeta = BrowserDetect.OS == "Mac" ? "ctrl" : "alt";

    self.hotKeyEvent = function(keyChar) {
        var ev = $.Event("keydown", { which : keyChar.toUpperCase().charCodeAt(0)});
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
}

window.chorus = window.chorus || new Chorus();

