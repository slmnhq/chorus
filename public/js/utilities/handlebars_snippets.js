(function () {

    Handlebars.registerPartial("errorDiv", '<div class="errors">{{#if serverErrors }}{{#if serverErrors.length}}<ul>{{#each serverErrors}}<li>{{message}}</li>{{/each}}</ul><a class="close_errors action" href="#">{{t "actions.close"}}</a>{{/if}}{{/if}}</div>');

    var templates = {}; //for memoizing handlebars helpers templates
    var expectedDateFormat = /^(\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}:\d{2})/;
    chorus.helpers = {
        cache_buster:function () {
            return new Date().getTime();
        },

        ifAdmin:function (block) {
            var user = chorus && chorus.session && chorus.session.user();
            if (user && user.get("admin")) {
                return block(this);
            } else {
                return block.inverse(this);
            }
        },

        ifCurrentUserNameIs:function (userName, block) {
            var user = chorus && chorus.session && chorus.session.user();
            if (user && user.get("userName") == userName) {
                return block(this);
            } else if (block.inverse) {
                return block.inverse(this);
            }
        },

        ifAll:function () {
            // Handlebars actually passes in two functions: the first is block with block.inverse,
            // and the second function is just the block.inverse function itself.
            var args = _.toArray(arguments);
            var elseBlock = args.pop();
            var block = args.pop();
            if (args.length == 0) {
                throw "ifAll expects arguments";
            }
            if (_.all(args, function (arg) {
                return !!arg
            })) {
                return block(this);
            } else {
                return elseBlock(this);
            }
        },

        ifAny:function () {
            var args = _.toArray(arguments);
            var elseBlock = args.pop();
            var block = args.pop();
            if (args.length == 0) {
                throw "ifAny expects arguments";
            }
            if (_.any(args, function (arg) {
                return !!arg
            })) {
                return block(this);
            } else {
                return elseBlock(this);
            }
        },

        currentUserName:function (block) {
            return chorus.session.get("userName");
        },

        displayNameFromPerson:function (person) {
            return [person.firstName, person.lastName].join(' ')
        },

        displayTimestamp:function (timestamp) {
            var date = Date.parseFromApi(timestamp)
            return date ? date.toString("MMMM d") : "WHENEVER"
        },

        relativeTimestamp:function (timestamp) {
            var date = Date.parseFromApi(timestamp);
            return date ? date.toRelativeTime(60000) : "WHENEVER"
        },

        moreLink:function (collection, max, more_key, less_key) {
            if (collection && collection.length > max) {
                templates.moreLinks = templates.moreLinks || Handlebars.compile(
                    "<ul class='morelinks'>\
                    <li><a class='more' href='#'>{{t more_key count=more_count}}</a></li>\
                    <li><a class='less' href='#'>{{t less_key count=more_count}}</a></li>\
                    </ul>"
                );

                return templates.moreLinks({
                    more_key:more_key,
                    more_count:collection.length - max,
                    less_key:less_key
                });
            } else {
                return "";
            }
        },

        eachWithMoreLink:function (context, max, more_key, less_key, fn, inverse) {
            var ret = "";

            if (context && context.length > 0) {
                for (var i = 0, j = context.length; i < j; i++) {
                    context[i].moreClass = (i >= max) ? "more" : "";
                    ret = ret + fn(context[i]);
                }
                ret += Handlebars.helpers.moreLink(context, max, more_key, less_key);
            } else {
                ret = inverse(this);
            }
            return ret;
        },

        userProfileLink:function (user) {
            templates.userLinkTemplate = templates.userLinkTemplate || Handlebars.compile("<a class='user' href='{{url}}'>{{name}}</a>");
            return templates.userLinkTemplate({ url:user.showUrl(), name:user.displayName() });
        },

        pluralize:function (collection, key) {
            if (collection.length == 1) {
                return t(key);
            } else {
                if (I18n.lookup(key + "_plural")) {
                    return t(key + "_plural");
                } else {
                    return t(key) + "s";
                }
            }
        },

        fileIconUrl:function (key, size) {
            return chorus.urlHelpers.fileIconUrl(key, size);
        },

        linkTo:function (url, text, attributes) {
            return $("<a></a>").attr("href", url).text(text).attr(attributes || {}).outerHtml();
        },

        spanFor:function (text, attributes) {
            return $("<span></span>").text(text).attr(attributes || {}).outerHtml()
        },

        renderTemplate:function (templateName, context) {
            if (!chorus.templates[templateName]) {
                var tag = $('#' + templateName + "_template");
                if (!tag.length) throw "No template for " + templateName;
                chorus.templates[templateName] = Handlebars.compile(tag.html());
            }
            return chorus.templates[templateName](context);
        },

        hotKeyName:function (hotKeyChar) {
            return _.str.capitalize(chorus.hotKeyMeta) + " + " + hotKeyChar;
        },

        workspaceUsage:function (percentageUsed, sizeText) {
            var markup = ""
            if (percentageUsed >= 100) {
                markup = '<div class="usage_bar">' +
                    '<div class="used full" style="width: 100%;">' +
                    '<span class="size_text">' + sizeText + '</span>' +
                    '<span class="percentage_text">' + percentageUsed + '%</span>' +
                    '</div>' +
                    '</div>'
            } else {
                if (percentageUsed >= 50) {
                    markup = '<div class="usage_bar">' +
                        '<div class="used" style="width: ' + percentageUsed + '%;">' +
                        '<span class="size_text">' + sizeText + '</span></div>' +
                        '</div>'
                } else {
                    markup = '<div class="usage_bar">' +
                        '<div class="used" style="width: ' + percentageUsed + '%;"></div>' +
                        '<span class="size_text">' + sizeText + '</span>' +
                        '</div>'
                }
            }
            return markup
        },

        range_chooser:function (options) {
            var max = options.hash.max || 20;
            options.hash.initial = options.hash.initial || max;
            return new Handlebars.SafeString(chorus.helpers.chooser_menu(_.range(1, max+1), options));
        },

        chooser_menu: function(choices, options) {
            options = options.hash;
            var selected = options.initial || choices[0];
            var translationKey = options.translationKey || "dataset.visualization.sidebar.category_limit";
            var className = options.className || '';
            var markup = "<div class='limiter " + className + "'><span class='pointing_l'></span>" + t(translationKey) + " &nbsp;<a href='#'><span class='selected_value'>" + selected + "</span><span class='triangle'></span></a><div class='limiter_menu_container'><ul class='limiter_menu " + className + "'>";
            _.each(choices, function(thing) {
                markup = markup + '<li>' + thing + '</li>';
            });
            markup = markup + '</ul></div></div>'
            return new Handlebars.SafeString(markup);
        }

    }

    _.each(chorus.helpers, function (helper, name) {
        Handlebars.registerHelper(name, helper);
    });

})();