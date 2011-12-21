;(function(ns) {
    ns.views.InstanceList = chorus.views.Base.extend({
        className : "instance_list",

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
                (elMap[model.get("instanceProvider")] || otherEl).append(li);
                view.delegateEvents();
            });
        }
    });
})(chorus);