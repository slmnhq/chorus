Handlebars.registerPartial("errorDiv",
    "<div class='errors'><ul>{{#each serverErrors}}<li>{{message}}</li>{{/each}}</ul></div>"
);

Handlebars.registerHelper("cache_buster", function() {
    return new Date().getTime();
});

Handlebars.registerHelper("ifAdmin", function(block) {
    if (chorus && chorus.user && chorus.user.get("admin")) {
        return block(this);
    } else {
        return block.inverse(this);
    }
});

Handlebars.registerHelper("ifCurrentUserNameIs", function(userName, block) {
    if (chorus && chorus.user && (chorus.user.get("userName") == userName)) {
        return block(this);
    } else if (block.inverse) {
        return block.inverse(this);
    }
})

Handlebars.registerHelper("ifAll", function() {
    // Handlebars actually passes in two functions: the first is block with block.inverse,
    // and the second function is just the block.inverse function itself.
    var args = _.toArray(arguments);
    var elseBlock = args.pop();
    var block = args.pop();
    if (args.length == 0) {
        throw "ifAll expects arguments";
    }
    if (_.all(args, _.identity)) {
        return block(this);
    } else {
        return elseBlock(this);
    }
});

Handlebars.registerHelper("ifAny", function() {
    var args = _.toArray(arguments);
    var elseBlock = args.pop();
    var block = args.pop();
    if (args.length == 0) {
        throw "ifAny expects arguments";
    }
    if (_.any(args)) {
        return block(this);
    } else {
        return elseBlock(this);
    }
});

Handlebars.registerHelper("currentUserName", function(block) {
    return chorus.session.get("userName");
});

Handlebars.registerHelper("displayNameFromPerson", function(person) {
    return [person.firstName, person.lastName].join(' ')
})

Handlebars.registerHelper("displayTimestamp", function(timestamp) {
    var match = timestamp && timestamp.match(/(.+)\.\d{1,3}/);
    if (match && match[1]) {
        return Date.parse(match[1], "yyyy-mm-dd H:m:s").toString("MMMM d")
    } else {
        return "WHENEVER";
    }
})

Handlebars.registerHelper("moreLink", function(collection, max, more_key, less_key) {
    if (collection && collection.length > max) {
        return Handlebars.compile("\
            <ul class='morelinks'>\
            <li><a class='more' href='#'>{{t more_key more_count}}</a></li>\
            <li><a class='less' href='#'>{{t less_key more_count}}</a></li>\
            </ul>")({
            more_key : more_key,
            more_count : collection.length - max,
            less_key : less_key
        });
    } else {
        return "";
    }
})

Handlebars.registerHelper("eachWithMoreLink", function(context, max, more_key, less_key, fn, inverse) {
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
})
