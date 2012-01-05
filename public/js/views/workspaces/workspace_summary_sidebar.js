;
(function(ns) {
    ns.views.WorkspaceSummarySidebar = ns.views.Sidebar.extend({
        className: "workspace_summary_sidebar",

        setup : function() {
            this.model.bind("image:change", this.render);
            this.model.members().fetch();
            this.model.members().bind("reset", this.render);
        },

        numMembers: 24,

        additionalContext : function() {
            return {
                workspaceAdmin : this.model.workspaceAdmin(),
                imageUrl : this.model.imageUrl()+"&buster="+(new Date().getTime()),
                hasImage : this.model.hasImage(),
                members : this.model.members().chain().first(this.numMembers).map(function(member){
                     return {
                         imageUrl : member.imageUrl({size : 'icon'}),
                         showUrl : member.showUrl(),
                         displayName : member.displayName()
                     };
                }).value(),
                extra_members : Math.max(this.model.members().length - this.numMembers, 0)
            };
        },

        postRender : function() {
            var self = this;
            this.$(".workspace_image").load(function() {
                self.$(".after_image").removeClass("hidden");
            });
            this.$('.workspace_image').load(_.bind(this.setupSidebarScrolling, this));
            this._super('postRender');
        }
    });
})(chorus);


