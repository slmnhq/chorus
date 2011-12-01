(function($, ns) {
    ns.WorkfileShowSidebar = chorus.views.Base.extend({
        className : "workfile_show_sidebar",

        setup : function() {
            var activitySet = new chorus.models.ActivitySet([
                        {
                            id : 10000,
                            timestamp : "2011-11-23 15:42:02.321",
                            type : "NOT_IMPLEMENTED",
                            author : {
                                username : "edcadmin",
                                firstName : "EDC",
                                lastName : "Admin"
                            },

                            comments : [
                                {
                                    id : 10023,
                                    timestamp : "2011-11-23 15:42:02.321",
                                    author : {
                                        username : "msofaer",
                                        firstName : "Michael",
                                        lastName : "Sofaer"
                                    },
                                    text : "hi there"
                                },
                                {
                                    id : 10024,
                                    timestamp : "2011-05-23 15:42:02.321",
                                    author : {
                                        username : "mrushakoff",
                                        firstName : "Mark",
                                        lastName : "Rushakoff"
                                    },
                                    text : "hello"
                                }
                            ]
                        },
                        {
                            id : 10001,
                            timestamp : "2011-04-23 15:42:02.321",
                            type : "NOT_IMPLEMENTED",
                            author : {
                                username : "dburkes",
                                firstName : "Danny",
                                lastName : "Burkes"
                            },

                            comments : []
                        }
                    ], {
                entityType : "workfile",
                entityId : this.model.get("id")
            });
            activitySet.loaded = true;
//            activitySet.fetch();

            this.activityList = new ns.ActivityList({ collection : activitySet });
        },

        additionalContext : function() {
            return {
                updatedAt : new Date(this.model.get("lastUpdatedStamp")).toString("MMMM d"),
                updatedBy : [this.model.get("modifiedByFirstName"), this.model.get("modifiedByLastName")].join(' '),
                modifierUrl : this.model.modifier().showUrl()
            }
        },

        postRender : function() {
            this.activityList.el = this.$(".activities")
            this.activityList.delegateEvents()
            this.activityList.render();
        }
    });
})(jQuery, chorus.views);
