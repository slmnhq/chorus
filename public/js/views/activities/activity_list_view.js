(function($, ns) {
    ns.ActivityList = chorus.views.Base.extend({
            tagName : "ul",
            className : "activity_list"
        },
        {
            cannedActivitySetFor : function(workfile) {
                var collection = new chorus.models.ActivitySet([
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
                                id : 10000,
                                timestamp : "2011-11-23 15:42:02.321",
                                author : {
                                    username : "edcadmin",
                                    firstName : "Michael",
                                    lastName : "Sofaer"
                                },
                                text : "hi there"
                            },
                            {
                                id : 10000,
                                timestamp : "2011-05-23 15:42:02.321",
                                author : {
                                    username : "edcadmin",
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
                    entityId : workfile.get("id")
                });
                collection.loaded = true;
                return collection;
            }
        });
})(jQuery, chorus.views);

