;(function(ns) {
    ns.views.InstanceList = chorus.views.Base.extend({
        className : "instance_list",

        events : {
            "click li" : "selectItem"
        },

        postRender : function() {
            var greenplumEl = this.$(".greenplum_instance ul");
            var hadoopEl = this.$(".hadoop_instance ul");
            var otherEl = this.$(".other_instance ul");
            var elMap = {
                "Greenplum Database" : greenplumEl,
                "Hadoop" : hadoopEl
            }
            this.collection.each(function(model) {
                var view = new ns.views.Instance({model: model});
                view.render();
                var li = $("<li class='instance'/>").append(view.el);
                li.data('model', model);
                (elMap[model.get("instanceProvider")] || otherEl).append(li);
                view.delegateEvents();
            });
            this.$('.instance_provider li:first').click();
        },

        selectItem : function(e){
            var target = $(e.currentTarget);
            if (target.hasClass("selected")) {
                return;
            }

            this.$("li").removeClass("selected");
            target.addClass("selected");
            var instance = target.data('model');
            this.trigger("instance:selected", instance);
        }
    });
})(chorus);