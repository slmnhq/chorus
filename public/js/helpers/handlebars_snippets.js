Handlebars.registerPartial("errorDiv",
    "<div class='errors'><ul>{{#each errors}}<li>{{message}}</li>{{/each}}</ul></div>"
);

Handlebars.registerHelper("cache_buster", function(){
    return new Date().getTime();
});

Handlebars.registerHelper("ifAdmin", function(block){
    if (chorus && chorus.user && chorus.user.get("admin")) {
        return block(this);
    } else {
        return block.inverse(this);
    }
});