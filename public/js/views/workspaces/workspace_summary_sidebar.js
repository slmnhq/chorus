;
(function(ns) {
    ns.views.WorkspaceSummarySidebar = ns.views.Base.extend({
        className: "workspace_summary_sidebar",

        setup : function() {
            this.model.bind("image:change", this.render);
            this.model.members().fetch();
            this.model.members().bind("reset", this.render);
        },

        additionalContext : function() {
            return {
                canUpdate : this.model.canUpdate(),
                imageUrl : this.model.imageUrl()+"&buster="+(new Date().getTime()),
                hasImage : this.model.hasImage(),
                members : this.model.members().chain().first(24).map(function(member){
                     return {
                         imageUrl : member.imageUrl({size : 'icon'}),
                         showUrl : member.showUrl()
                     };
                }).value(),
                extra_members : Math.max(this.model.members().length - 24, 0)
            };
        },

        postRender : function() {
            var self = this;
            this.$(".workspace_image").load(function() {
                self.$(".after_image").removeClass("hidden");
            });
        }
    });
})(chorus);
