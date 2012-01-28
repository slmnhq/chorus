chorus.pages.InvalidRoutePage = chorus.pages.Base.extend({
    crumbs:[
        { label:t("breadcrumbs.home"), url:"#/" },
        { label:"???" }
    ],

    setup:function (path) {
        this.mainContent = new chorus.views.MainContentView({
            content:new chorus.views.StaticTemplate("plain_text", {text:"No route matched for: " + path}),
            contentHeader:new chorus.views.StaticTemplate("default_content_header", {title:"Invalid Route: " + path})
        });
    }
});