chorus.views.StaticTemplate = function (className, context) {
    var klass = chorus.views.Base.extend({
        constructorName: "StaticTemplate",
        className:className,
        context:context,

        postRender:function () {
            this.$(this.el).addClass((className || "").replace("/", "_"))
        }
    });

    return new klass();
}