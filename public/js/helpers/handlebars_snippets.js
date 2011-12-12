(function(ns, Handlebars){

    Handlebars.registerPartial("errorDiv", "<div class='errors'><ul>{{#each serverErrors}}<li>{{message}}</li>{{/each}}</ul></div>");

    var templates = {}; //for memoizing handlebars helpers templates
    var expectedDateFormat = /^(\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}:\d{2})/;
    ns.helpers = {
        cache_buster: function() {
            return new Date().getTime();
        },

        ifAdmin: function(block) {
            if (chorus && chorus.user && chorus.user.get("admin")) {
                return block(this);
            } else {
                return block.inverse(this);
            }
        },

        ifCurrentUserNameIs: function(userName, block) {
            if (chorus && chorus.user && (chorus.user.get("userName") == userName)) {
                return block(this);
            } else if (block.inverse) {
                return block.inverse(this);
            }
        },

        ifAll: function() {
            // Handlebars actually passes in two functions: the first is block with block.inverse,
            // and the second function is just the block.inverse function itself.
            var args = _.toArray(arguments);
            var elseBlock = args.pop();
            var block = args.pop();
            if (args.length == 0) {
                throw "ifAll expects arguments";
            }
            if (_.all(args, function(arg) { return !!arg })) {
                return block(this);
            } else {
                return elseBlock(this);
            }
        },

        ifAny: function() {
            var args = _.toArray(arguments);
            var elseBlock = args.pop();
            var block = args.pop();
            if (args.length == 0) {
                throw "ifAny expects arguments";
            }
            if (_.any(args, function(arg) { return !!arg })) {
                return block(this);
            } else {
                return elseBlock(this);
            }
        },

        currentUserName: function(block) {
            return chorus.session.get("userName");
        },

        displayNameFromPerson: function(person) {
            return [person.firstName, person.lastName].join(' ')
        },

        displayTimestamp: function(timestamp) {
            var date = Date.parseFromApi(timestamp)
            return date ? date.toString("MMMM d") : "WHENEVER"
        },

        relativeTimestamp: function(timestamp) {
            var date = Date.parseFromApi(timestamp);
            return date ? date.toRelativeTime() : "WHENEVER"
        },

        moreLink: function(collection, max, more_key, less_key) {
            if (collection && collection.length > max) {
                templates.moreLinks = templates.moreLinks || Handlebars.compile(
                    "<ul class='morelinks'>\
                    <li><a class='more' href='#'>{{t more_key more_count}}</a></li>\
                    <li><a class='less' href='#'>{{t less_key more_count}}</a></li>\
                    </ul>"
                );

                return templates.moreLinks({
                    more_key : more_key,
                    more_count : collection.length - max,
                    less_key : less_key
                });
            } else {
                return "";
            }
        },

        eachWithMoreLink : function(context, max, more_key, less_key, fn, inverse) {
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

        userProfileLink : function(user) {
            templates.userLinkTemplate = templates.userLinkTemplate || Handlebars.compile("<a class='user' href='{{url}}'>{{name}}</a>");
            return templates.userLinkTemplate({ url : user.showUrl(), name : user.displayName() });
        }
    }

    _.each(ns.helpers, function(helper, name) {
        Handlebars.registerHelper(name, helper);
    });

})(chorus, Handlebars);
