Handlebars.registerPartial("errorDiv",
    "<div class='errors'><ul>{{#each errors}}<li>{{message}}</li>{{/each}}</ul></div>"
);

Handlebars.registerHelper("cache_buster", function(){
    return new Date().getTime();
});