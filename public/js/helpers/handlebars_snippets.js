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

(function() {
    var map = {
        "C" : "c",
        "C++" : "cplusplus",
        "Java" : "java",
        "sql" : "sql",
        "txt" : "text"
    }

    Handlebars.registerHelper("workfileIconUrl", function(fileType) {
        return "/images/workfileIcons/" + (map[fileType] || "binary") + ".png";
    });
})();