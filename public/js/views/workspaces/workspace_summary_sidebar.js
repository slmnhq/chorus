;
(function(ns) {
    ns.views.WorkspaceSummarySidebar = ns.views.Base.extend({
        className: "workspace_summary_sidebar",

        setup : function() {
            this.model.bind("image:change", this.render);
            this.model.members().fetch();
        },

        additionalContext : function() {
            return {
                canUpdate : this.model.canUpdate(),
                imageUrl : this.model.imageUrl()+"&buster="+(new Date().getTime()),
                hasImage : this.model.hasImage(),
                members : this.model.members().map(function(member){
                     return {
                         imageUrl : member.imageUrl && member.imageUrl({size : 'icon'}),
                         showUrl : member.showUrl && member.showUrl()
                     };
                })
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
