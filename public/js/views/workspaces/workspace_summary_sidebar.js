;
(function(ns) {
    ns.views.WorkspaceSummarySidebar = ns.views.Base.extend({
        className: "workspace_summary_sidebar",

        setup : function() {
            this.model.bind("image:change", this.render);
        },

        additionalContext : function() {
            return {
                canUpdate : this.model.canUpdate(),
                imageUrl : this.model.imageUrl()+"&buster="+(new Date().getTime()),
                hasImage : this.model.hasImage()

            };
        },

        postRender : function() {
            var self = this;
            this.$("img").load(function() {
                self.$(".actions").removeClass("hidden");
            });
        }
    });
})(chorus);
