chorus.views.StaticTemplate = function (templateName, context) {
    var klass = chorus.views.Base.extend({
        constructorName: "StaticTemplate",
        templateName:templateName,
        context:context,

        postRender:function () {
            this.$(this.el).addClass((templateName || "").replace("/", "_"))
        }
    });

    return new klass();
}