beforeEach(function() {
    this.prepareResponse = function(responseJSON) {
        return [200, {
            'Content-Type': 'application/json'
        },
            JSON.stringify(responseJSON)];
    };

    this.completeSaveFor = function(model) {
        var response = {
            status: "ok",
            resource : [
                model.attributes
            ]
        };
        var method = model.isNew() ? 'POST' : 'PUT'
        this.server.respondWith(
            method,
            model.url(),
            this.prepareResponse(response));
        this.server.respond();
    };

    this.failSaveFor = function(model, message, overrides) {
        var response = {
            status: "fail",
            message: [message],
            resource: []
        }
        var method = overrides.method || (model.isNew() ? 'POST' : 'PUT');
        var url = overrides.url || model.url();

        this.server.respondWith(
            method,
            url,
            this.prepareResponse(response)
        );
        this.server.respond();
    }

    window.fixtures = function(model) {
        var self = this;

        return {
            jsonFor: function jsonFor(key, options) {
                return self.fixtures.jsonFor(key, $.extend({
                        model: model
                    },
                    options));
            },

            modelFor: function modelFor(key, options) {
                var klass = chorus.models[model] || chorus.collections[model];
                var obj = new klass(null, options);
                var data = klass.prototype.parse.call(obj, self.fixtures.jsonFor(key, {
                    model: model
                }));
                if (obj.set) {
                    obj.set(data);
                } else {
                    obj.reset(data, options);
                }
                return obj;
            }
        };
    };

    $.extend(window.fixtures, {
        jsonFor: function jsonFor(key, options) {
            var config = $.extend({
                    model: this.model,
                    overrides: {}
                },
                options || {});

            var source = this[config.model];

            if (!source) {
                throw "The model you asked for (" + config.model + ") is not in fixtures";
                this.fail("The model you asked for (" + config.model + ") is not in fixtures");
            }

            if (!source[key]) {
                throw "The key you asked for (" + key + ") is not in fixtures for " + config.model;
                this.fail("The key you asked for (" + key + ") is not in fixtures for " + config.model);
            }

            return $.extend(source[key], config.overrides);
        },

        modelFor: function modelFor(key, options) {
            var klass = chorus.models[this.model] || chorus.collections[this.model];
            var obj = new klass(null, options);
            var data = klass.prototype.parse.call(obj, self.fixtures.jsonFor(key, {
                model: this.model
            }));
            if (obj.set) {
                obj.set(data);
            } else {
                obj.reset(data, options);
            }
            return obj;
        },

        Session: {
            save: {
                "message":
                    [

                    ],
                "status": "ok",
                "requestId": 4,
                "resource":
                    [
                        {
                            "userName": "edcadminlol",
                            "admin": true,
                            "firstName": "EDC",
                            "lastName": "Admin",
                            "fullName": "EDC Admin",
                            "authid": "4b11614a29bb62f3a56f7ff141e90db91320194325353.539273276006",
                            "use_external_ldap": false
                        }
                    ],
                "method": "POST",
                "resourcelink": "/edc/auth/login/",
                "pagination": null,
                "version": "0.1"
            },

            saveFailure: {
                "message":
                    [
                        {
                            "message": "Username or password is incorrect.",
                            "msgcode": "E_2_0006",
                            "description": null,
                            "severity": "error",
                            "msgkey": "USER.LOGIN_FAILED"
                        }
                    ],
                "status": "fail",
                "requestId": 3,
                "resource":
                    [

                    ],
                "method": "POST",
                "resourcelink": "/edc/auth/login/",
                "pagination": null,
                "version": "0.1"
            }
        },

        User: {
            fetch : {
                "message":[],
                "status":"ok",
                "requestId":108,
                "resource":[
                    {
                        "id":"42",
                        "userName":"edcadmin",
                        "firstName":"EDC",
                        "lastName":"Admin",
                        "emailAddress":"edcadmin@example.com",
                        "title":null,
                        "ou":null,
                        "manager":null,
                        "streetAddress":null,
                        "l":null,
                        "st":null,
                        "c":null,
                        "admin":true,
                        "notes":null,
                        "lastLogin":"2011-11-16 09:40:27.916",
                        "imageId":"10036",
                        "dn":null,
                        "isDeleted":false,
                        "dumb":null,
                        "lastUpdatedStamp":"2011-11-16 12:34:47.632",
                        "lastUpdatedTxStamp":"2011-11-16 12:34:47.454",
                        "createdStamp":"2011-11-03 10:49:41.346",
                        "createdTxStamp":"2011-11-03 10:49:41.342"
                    }
                ],
                "method":"GET",
                "resourcelink":"/edc/user/edcadmin",
                "pagination":null,
                "version":"0.1"
            }
        },

        UserSet: {
            fetch:
            {
                "message": [],
                "status": "ok",
                "requestId": 8,
                "resource": [
                    {
                        "id":"10000",
                        "userName": "markr",
                        "firstName": "Mark",
                        "lastName": "Rushakoff",
                        "emailAddress": "markymark@pivotallabs.com",
                        "title": "Title",
                        "admin": false,
                        "notes": null,
                        "lastLogin": "2011-11-03 17:45:39",
                        "isDeleted": false
                    },
                    {
                        "id":"10001",
                        "userName": "edcadmin",
                        "firstName": "EDC",
                        "lastName": "Admin",
                        "emailAddress": "edcadmin@greenplum.com",
                        "title": "Engineer",
                        "admin": true,
                        "notes": null,
                        "lastLogin": "2011-11-03 17:45:39",
                        "isDeleted": false
                    },
                    {
                        "id":"10002",
                        "userName": "frogman",
                        "firstName": "frOg",
                        "lastName": "man",
                        "emailAddress": "frogman@greenplum.com",
                        "title": "Frog-man",
                        "admin": false,
                        "notes": null,
                        "lastLogin": "2011-11-03 17:45:39",
                        "isDeleted": false
                    }
                ],
                "method": "GET",
                "resourcelink": "/edc/user/",
                "pagination": {
                    "total": "2",
                    "page": "1",
                    "records": "22"
                },
                "version": "0.1"
            }

        },

        Workspace : {
            fetch : {
                "message":[],
                "status":"ok",
                "requestId":3697,
                "resource":[
                    {
                        "id":"10013",
                        "ownerFullName":"EDC Admin",
                        "name":"fortune",
                        "description":"a cool workspace",
                        "createdStamp":"2011-11-14",
                        "owner":"edcadmin",
                        "isPublic":true,
                        "iconId":null,
                        "state":1,
                        "summary":"this is the workspace summary",
                        "sandboxInfo": {
                            databaseId: null,
                            databaseName: null,
                            instanceId: null,
                            instanceName: null,
                            sandboxId: null,
                            schemaId: null,
                            schemaName: null
                        },
                        "active":true,
                        "permission":["admin"]
                    }
                ],
                "method":"GET",
                "resourcelink":"/edc/workspace/10013",
                "pagination":null,
                "version":"0.1"
            },
            fetchWithLatestComments : {
                "message":[],
                "status":"ok",
                "requestId":3697,
                "resource":[
                    {
                        "id":"10013",
                        "ownerFullName":"EDC Admin",
                        "name":"fortune",
                        "description":"a cool workspace",
                        "createdStamp":"2011-11-14",
                        "owner":"edcadmin",
                        "isPublic":true,
                        "iconId":null,
                        "state":1,
                        "summary":"this is the workspace summary",
                        "sandboxInfo": {
                            databaseId: null,
                            databaseName: null,
                            instanceId: null,
                            instanceName: null,
                            sandboxId: null,
                            schemaId: null,
                            schemaName: null
                        },
                        "active":true,
                        "permission":["admin"],
                        "latestCommentList": [
                            {
                                "timestamp": "2011-12-08 17:16:47",
                                "id": 10050,
                                "author": {
                                    "id": "InitialUser",
                                    "lastName": "Admin",
                                    "firstName": "EDC"
                                },
                                "text": "This rocks, man",
                                "attachments": [],
                                "type": "NOTE",
                                "comments": []
                            }
                        ]
                    }
                ],
                "method":"GET",
                "resourcelink":"/edc/workspace/10013",
                "pagination":null,
                "version":"0.1"
            }

        },

        Workfile : {
            copyFailed : {
                "message":[
                    {
                        "message":"Workspace already has a workfile with this name. Specify a different name.",
                        "msgcode":"E_14_0013",
                        "description":null,
                        "severity":"error",
                        "msgkey":"WORKFILE.FILENAME_EXISTS"
                    }
                ],
                "status":"fail",
                "requestId":1156,
                "resource":[],
                "method":"POST",
                "resourcelink":"/edc/workspace/10010/workfile",
                "pagination":null,
                "version":"0.1"
            }
        },

        Activity : {
            fetch : {
                "message" : [ ],
                "status" : "ok",
                "requestId" : 256,
                "resource" : [
                    {
                        id : 10000,
                        timestamp : "2011-11-23 15:42:02.321",
                        type : "NOT_IMPLEMENTED",
                        author : {
                            userName : "edcadmin",
                            firstName : "EDC",
                            lastName : "Admin"
                        },

                        comments : [
                            {
                                id : 10023,
                                timestamp : "2011-11-23 15:42:02.321",
                                author : {
                                    userName : "msofaer",
                                    firstName : "Michael",
                                    lastName : "Sofaer"
                                },
                                text : "hi there"
                            },
                            {
                                id : 10024,
                                timestamp : "2011-11-23 15:42:02.321",
                                author : {
                                    userName : "mrushakoff",
                                    firstName : "Mark",
                                    lastName : "Rushakoff"
                                },
                                text : "hello"
                            }
                        ]
                    }
                ],
                "method" : "GET",
                "resourcelink" : "/edc/activitystream/workspace/10000",
                "pagination" : null,
                "version" : "0.1"
            }

        },

        ActivitySet : {
            fetch : {
                "message" : [ ],
                "status" : "ok",
                "requestId" : 256,
                "resource" : [
                    {
                        id : 10000,
                        timestamp : "2011-11-23 15:42:02.321",
                        type : "NOTE",
                        author : {
                            id : "11",
                            userName : "edcadmin",
                            firstName : "EDC",
                            lastName : "Admin"
                        },

                        workspace : {
                            id : "10203",
                            name : "my workspace"
                        },

                        comments : [
                            {
                                id : 10023,
                                timestamp : "2011-11-23 15:42:02.321",
                                author : {
                                    id : "12",
                                    userName : "msofaer",
                                    firstName : "Michael",
                                    lastName : "Sofaer"
                                },
                                text : "hi there"
                            },
                            {
                                id : 10024,
                                timestamp : "2011-05-23 15:42:02.321",
                                author : {
                                    id : "13",
                                    userName : "mrushakoff",
                                    firstName : "Mark",
                                    lastName : "Rushakoff"
                                },
                                text : "hello"
                            }
                        ],
                        artifacts : [
                            {
                                entityId: "10101",
                                entityType: "file",
                                id: "10101",
                                name: "something.sql",
                                type: "SQL"
                            },
                            {
                                entityId: "10102",
                                entityType: "file",
                                id: "10102",
                                name: "something.txt",
                                type: "TXT"
                            }
                        ]
                    },
                    {
                        id : 10001,
                        timestamp : "2011-04-23 15:42:02.321",
                        type : "NOTE",
                        author : {
                            id : "14",
                            userName : "dburkes",
                            firstName : "Danny",
                            lastName : "Burkes"
                        },

                        workspace : {
                            id : "10203",
                            name : "my workspace"
                        },
                        comments : [],
                        artifacts : []
                    }
                ],
                "method" : "GET",
                "resourcelink" : "/edc/activitystream/workspace/10000",
                "pagination" :
                {
                    "total" : "1",
                    "page" : "1",
                    "records" : "8"
                },
                "version" : "0.1"
            }
        },

        Instance : {
            fetch : {
                "message" : [],
                "status" : "ok",
                "requestId" : 260,
                "resource" :
                    [
                        {
                            "name" : "instance1",
                            "description" : "11",
                            "owner" : "edcadmin",
                            "ownerFullName" : "EDC Admin",
                            "ownerId" : "10111",
                            "host" : "10.32.88.200",
                            "port" : 5432,
                            "state" : "online",
                            "provisionType" : "register",
                            "instanceProvider" : "Greenplum Database and Hadoop",
                            "isDeleted" : false,
                            "id" : "10000",
                            "lastUpdatedTxStamp" : "2011-09-29 09:22:03.562",
                            "createdTxStamp" : "2011-09-29 09:22:03.562",
                            "lastUpdatedStamp" : "2011-09-29 09:22:03.836",
                            "createdStamp" : "2011-09-29 09:22:03.836"
                        }
                    ],
                "method" : "GET",
                "resourcelink" : "/edc/instance/",
                "pagination" : null,
                "version" : "0.1"
            },

            fetchWithSharedAccount : {
                "message" : [],
                "status" : "ok",
                "requestId" : 260,
                "resource" :
                    [
                        {
                            "name" : "instance1",
                            "description" : "11",
                            "owner" : "edcadmin",
                            "ownerFullName" : "EDC Admin",
                            "ownerId" : "10111",
                            "host" : "10.32.88.200",
                            "port" : 5432,
                            "state" : "online",
                            "provisionType" : "register",
                            "instanceProvider" : "Greenplum Database and Hadoop",
                            "isDeleted" : false,
                            "id" : "10000",
                            "lastUpdatedTxStamp" : "2011-09-29 09:22:03.562",
                            "createdTxStamp" : "2011-09-29 09:22:03.562",
                            "lastUpdatedStamp" : "2011-09-29 09:22:03.836",
                            "createdStamp" : "2011-09-29 09:22:03.836",
                            "sharedAccount" : {
                                "dbUserName" : "the_dude"
                            }
                        }
                    ],
                "method" : "GET",
                "resourcelink" : "/edc/instance/",
                "pagination" : null,
                "version" : "0.1"
            }
        },

        currentId: 1,
        nextId: function() {
            return this.currentId++;
        },

        activities: {
            "MEMBERS_ADDED" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "MEMBERS_ADDED",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    user: [
                        {
                            id: 101,
                            name: "Rhino Hunter"
                        },
                        {
                            id: 102,
                            name: "Method Man"
                        }
                    ],
                    workspace: fixtures.workspaceJson()
                });
            },

            "MEMBERS_DELETED" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "MEMBERS_DELETED",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    user: [
                        {
                            id: 101,
                            name: "Rhino Hunter"
                        },
                        {
                            id: 102,
                            name: "Method Man"
                        }
                    ],
                    workspace: fixtures.workspaceJson()
                });
            },

            "WORKSPACE_DELETED" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "WORKSPACE_DELETED",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    workspace: fixtures.workspaceJson()
                });
            },

            "WORKSPACE_CREATED" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "WORKSPACE_CREATED",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    workspace: fixtures.workspaceJson()
                });
            },

            "WORKSPACE_MAKE_PRIVATE" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "WORKSPACE_MAKE_PRIVATE",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    workspace: fixtures.workspaceJson()
                });
            },

            "WORKSPACE_MAKE_PUBLIC" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "WORKSPACE_MAKE_PUBLIC",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    workspace: fixtures.workspaceJson()
                });
            },

            "WORKFILE_CREATED" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "WORKFILE_CREATED",
                    timestamp: "2011-12-12 12:12:12",
                    id: fixtures.nextId(),
                    isPromoted: false,
                    promoteCount: 0,
                    workfile : fixtures.nestedWorkfileJson(),
                    workspace : fixtures.nestedWorkspaceJson(),
                    comments: [
                        {
                            text: "OBAMA!!!!",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    artifacts : [
                        {
                            entityId: "10101",
                            entityType: "file",
                            id: "10101",
                            name: "something.sql",
                            type: "SQL"
                        }
                    ]
                });
            },

            "WORKFILE_UPGRADED_VERSION" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "WORKFILE_UPGRADED_VERSION",
                    timestamp: "2011-12-12 12:12:12",
                    id: 10860,
                    isPromoted: false,
                    promoteCount: 0,
                    commitMessage: "make file better",
                    version: "3",
                    workfile : fixtures.nestedWorkfileJson(),
                    workspace : fixtures.nestedWorkspaceJson(),
                    comments: [
                        {
                            text: "OBAMA!!!!",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ]
                });
            },

            "NOTE_ON_INSTANCE" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "NOTE",
                    text: "How about that.",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    instance : fixtures.instanceJson(),
                    artifacts : [
                        {
                            entityId: "10101",
                            entityType: "file",
                            id: "10101",
                            name: "something.sql",
                            type: "SQL"
                        },
                        {
                            entityId: "10102",
                            entityType: "file",
                            id: "10102",
                            name: "something.txt",
                            type: "TXT"
                        }
                    ]
                });
            },

            "NOTE_ON_CHORUS_VIEW" : function(overrides) {
                var instanceId = fixtures.nextId().toString();
                var attrs = _.extend({
                    author: fixtures.authorJson(),
                    type: "NOTE",
                    text: "How about that view.",
                    timestamp: "2011-12-01 00:00:00",
                    id: fixtures.nextId().toString(),
                    comments: [
                        {
                            text: "sub-comment 1",
                            author: fixtures.authorJson(),
                            timestamp: "2011-12-15 12:34:56"
                        }
                    ],
                    chorusView: {
                        id: instanceId + '|dca_demo|public|__a_table_name',
                        name: '__a_chorus_view_name',
                        objectName: "__a_chorus_view_name",
                        objectType: "QUERY",
                        type: "CHORUS_VIEW"
                    },
                    artifacts: [
                        {
                            entityId: "10101",
                            entityType: "file",
                            id: "10101",
                            name: "something.sql",
                            type: "SQL"
                        },
                        {
                            entityId: "10102",
                            entityType: "file",
                            id: "10102",
                            name: "something.txt",
                            type: "TXT"
                        }
                    ],
                    workspace: fixtures.nestedWorkspaceJson()
                }, overrides);
                return new chorus.models.Activity(attrs);
            },

            "NOTE_ON_DATASET_TABLE": function(overrides) {
                var instanceId = fixtures.nextId().toString();
                var attrs = _.extend({
                    author: fixtures.authorJson(),
                    type: "NOTE",
                    text: "How about that view.",
                    timestamp: "2011-12-01 00:00:00",
                    id: fixtures.nextId().toString(),
                    comments: [
                        {
                            text: "sub-comment 1",
                            author: fixtures.authorJson(),
                            timestamp: "2011-12-15 12:34:56"
                        }
                    ],
                    databaseObject: {
                        id: instanceId + '|dca_demo|public|__a_table_name',
                        name: '__a_table_name',
                        objectType: "BASE_TABLE",
                        type: "databaseObject"
                    },
                    artifacts: [
                        {
                            entityId: "10101",
                            entityType: "file",
                            id: "10101",
                            name: "something.sql",
                            type: "SQL"
                        },
                        {
                            entityId: "10102",
                            entityType: "file",
                            id: "10102",
                            name: "something.txt",
                            type: "TXT"
                        }
                    ],
                    workspace: fixtures.nestedWorkspaceJson()
                }, overrides);
                return new chorus.models.Activity(attrs);
            },

            "NOTE_ON_DATABASE_TABLE": function(overrides) {
                var instanceId = fixtures.nextId().toString();
                var attrs = _.extend({
                    author: fixtures.authorJson(),
                    type: "NOTE",
                    text: "How about that view.",
                    timestamp: "2011-12-01 00:00:00",
                    id: fixtures.nextId().toString(),
                    comments: [
                        {
                            text: "sub-comment 1",
                            author: fixtures.authorJson(),
                            timestamp: "2011-12-15 12:34:56"
                        }
                    ],
                    databaseObject: {
                        id: instanceId + '|dca_demo|public|__a_table_name',
                        name: '__a_table_name',
                        objectType: "BASE_TABLE",
                        type: "databaseObject"
                    },
                    artifacts: [
                        {
                            entityId: "10101",
                            entityType: "file",
                            id: "10101",
                            name: "something.sql",
                            type: "SQL"
                        },
                        {
                            entityId: "10102",
                            entityType: "file",
                            id: "10102",
                            name: "something.txt",
                            type: "TXT"
                        }
                    ]
                }, overrides);
                return new chorus.models.Activity(attrs);
            },

            "NOTE_ON_DATASET_VIEW": function(overrides) {
                var instanceId = fixtures.nextId().toString();
                var attrs = _.extend({
                    author: fixtures.authorJson(),
                    type: "NOTE",
                    text: "How about that view.",
                    timestamp: "2011-12-01 00:00:00",
                    id: fixtures.nextId().toString(),
                    comments: [
                        {
                            text: "sub-comment 1",
                            author: fixtures.authorJson(),
                            timestamp: "2011-12-15 12:34:56"
                        }
                    ],
                    databaseObject: {
                        id: instanceId + '|dca_demo|public|__a_view_name',
                        name: '__a_view_name',
                        objectType: "BASE_VIEW",
                        type: "databaseObject"
                    },
                    artifacts: [
                        {
                            entityId: "10101",
                            entityType: "file",
                            id: "10101",
                            name: "something.sql",
                            type: "SQL"
                        },
                        {
                            entityId: "10102",
                            entityType: "file",
                            id: "10102",
                            name: "something.txt",
                            type: "TXT"
                        }
                    ],
                    workspace: fixtures.nestedWorkspaceJson()
                }, overrides);
                return new chorus.models.Activity(attrs);
            },

            "NOTE_ON_WORKSPACE" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "NOTE",
                    text: "How about that.",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    workspace : fixtures.workspaceJson(),
                    artifacts : [
                        {
                            entityId: "10101",
                            entityType: "file",
                            id: "10101",
                            name: "something.sql",
                            type: "SQL"
                        },
                        {
                            entityId: "10102",
                            entityType: "file",
                            id: "10102",
                            name: "something.txt",
                            type: "TXT"
                        }
                    ]
                });
            },

            "NOTE_ON_WORKFILE_JSON" : function() {
                return {
                    author: fixtures.authorJson(),
                    type: "NOTE",
                    text: "How about that.",
                    timestamp: "2011-12-01 00:00:00",
                    id : fixtures.nextId().toString(),
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    workfile : fixtures.nestedWorkfileJson(),
                    workspace : fixtures.workspaceJson(),
                    artifacts : [
                        {
                            entityId: fixtures.nextId().toString(),
                            entityType: "file",
                            id: fixtures.nextId().toString(),
                            name: "something.sql",
                            type: "SQL"
                        },
                        {
                            entityId: fixtures.nextId().toString(),
                            entityType: "file",
                            id: fixtures.nextId().toString(),
                            name: "something.txt",
                            type: "TXT"
                        }
                    ]
                };
            },

            "NOTE_ON_DATASET_JSON" : function() {
                return {
                    author: fixtures.authorJson(),
                    type: "NOTE",
                    text: "How about that.",
                    timestamp: "2011-12-01 00:00:00",
                    id : fixtures.nextId().toString(),
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    artifacts: [],
                    isPromoted: false,
                    promoteCount: 0,
                    table: {
                        id: "10114|dca_demo|public|a",
                        name: "a"
                    }
                };
            },

            "NOTE_ON_WORKFILE" : function() {
                return new chorus.models.Activity(fixtures.activities.NOTE_ON_WORKFILE_JSON());
            },

            "NOTE_ON_DATASET" : function() {
                return new chorus.models.Activity(fixtures.activities.NOTE_ON_DATASET_JSON());
            },

            "NOTE_ON_THING_WE_DONT_SUPPORT_YET" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "NOTE",
                    text: "How about that.",
                    timestamp: "2011-12-01 00:00:00",
                    id : fixtures.nextId().toString(),
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    artifacts : [
                        {
                            entityId: fixtures.nextId().toString(),
                            entityType: "file",
                            id: fixtures.nextId().toString(),
                            name: "something.sql",
                            type: "SQL"
                        },
                        {
                            entityId: fixtures.nextId().toString(),
                            entityType: "file",
                            id: fixtures.nextId().toString(),
                            name: "something.txt",
                            type: "TXT"
                        }
                    ]
                })
            },

            "INSIGHT_CREATED" : function() {
                return new chorus.models.Activity(
                    _.extend(this.NOTE_ON_DATASET_JSON(), {type: "INSIGHT_CREATED", isInsight: true})
                );
            },

            "USER_ADDED" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "USER_ADDED",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    user : {
                        id : "12345",
                        name: "Bill Smith"
                    }
                });
            },

            "USER_DELETED" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "USER_DELETED",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    user : {
                        id : "12345",
                        name: "Bill Smith"
                    }
                });
            },

            "INSTANCE_CREATED" : function() {
                return new chorus.models.Activity({
                    "timestamp":"2011-12-22 12:09:59",
                    "id":10910,
                    "author": fixtures.authorJson(),
                    "instance":fixtures.instanceJson(),
                    "type":"INSTANCE_CREATED",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ]
                });
            },

            "WORKSPACE_ARCHIVED" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "WORKSPACE_ARCHIVED",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    workspace: fixtures.workspaceJson()
                });
            },

            "WORKSPACE_UNARCHIVED" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "WORKSPACE_UNARCHIVED",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    workspace: fixtures.workspaceJson()
                });
            },

            "WORKSPACE_ADD_SANDBOX" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "WORKSPACE_ADD_SANDBOX",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    workspace: fixtures.workspaceJson()
                });
            },

            "DATASET_CREATED" : function() {
                return new chorus.models.Activity({
                    author: fixtures.authorJson(),
                    type: "DATASET_CREATED",
                    timestamp: "2011-12-01 00:00:00",
                    id : "10101",
                    workspace : fixtures.workspaceJson(),
                    comments: [
                        {
                            text: "sub-comment 1",
                            author : fixtures.authorJson(),
                            timestamp : "2011-12-15 12:34:56"
                        }
                    ],
                    isPromoted: false,
                    promoteCount: 0,
                    databaseObject: {
                        id: "10000|Analytics|analytics|BASE_TABLE|clv_data",
                        name: "clv_data",
                        objectName: "clv_data",
                        objectType: "BASE_TABLE",
                        type: "SOURCE_TABLE",
                        workspaceId: "10000"
                    }
                });
            }
        },

        activityJson: function(overrides) {
            var id = fixtures.nextId();
            return _.extend({
                author: fixtures.authorJson(),
                type: "NOTE",
                text: "How about that.",
                timestamp: "2011-12-01 00:00:00",
                id : id,
                comments: [
                    fixtures.commentJson()
                ],
                artifacts : [
                    fixtures.artifactJson()
                ]
            }, overrides);
        },

        artifactJson: function() {
            var id = fixtures.nextId().toString();
            return {
                entityId: fixtures.nextId().toString(),
                entityType: "file",
                id: id,
                name: "something" + id + ".sql",
                type: "SQL"
            }
        },

        authorJson: function() {
            return {
                id : "1234",
                lastName : "Smith",
                firstName : "Bob"
            }
        },

        commentJson: function() {
            return {
                text: "sub-comment 1",
                author : fixtures.authorJson(),
                timestamp : "2011-12-15 12:34:56"
            }
        },

        configJson: function(overrides) {
            return _.extend({
                provisionMaxSizeInGB : 2000,
                logLevel : "INFO",
                provisionMaxSize : "2000 GB",
                sandboxRecommendSizeInBytes : 5368709120,
                sandboxRecommendSize : "5 GB"
            }, overrides);
        },

        databaseJson: function(overrides) {
            var id = this.nextId().toString();

            return _.extend({
                id : id,
                connectable : true,
                name : "Database_" + id,
                creatable : true
            }, overrides);
        },

        instanceJson: function() {
            var id = this.nextId();
            return {
                id : id.toString(),
                name : 'Instance_' + id
            }
        },

        instanceWorkspaceUsageJson: function(overrides) {
            var workspaceId = this.nextId().toString();
            return _.extend({
                workspaceId: workspaceId,
                workspaceName: "workspace" + workspaceId,
                iconId: null,
                workspaceOwnerFullName: "EDC Admin",
                sandboxId: this.nextId().toString(),
                databaseName: "Analytics",
                schemaName: "analytics",
                ownerFullName: "EDC Admin",
                sizeInBytes: "1648427008",
                size: "1.5GB"
            }, overrides);
        },

        userJson: function(overrides) {
            var id = this.nextId().toString();
            return _.extend({
                id : id,
                userName : "user" + id,
                firstName : "EDC" + id,
                lastName : "Admin" + id
            }, overrides)
        },

        nestedWorkfileJson: function() {
            var id = this.nextId().toString();
            return {
                id : id,
                name : "file" + id + ".sql"
            }
        },

        nestedWorkspaceJson: function() {
            var id = this.nextId().toString();
            return {
                id : id,
                name : "workspace" + id
            };
        },

        versionInfoJson: function(overrides, modifiedByUser) {
            var id = this.nextId().toString();
            return _.extend({
                versionNum : 1,
                lastUpdatedStamp : "2011-11-29 10:46:03.255",
                versionFileId: this.nextId().toString(),
                content: "Workfile Content!" + id,
                modifiedByFirstName: modifiedByUser.firstName,
                modifiedByLastName: modifiedByUser.lastName,
                modifiedById: modifiedByUser.id,
                versionOwner : "edcadmin",
                commitMessage : null,
                isEditable : true
            }, overrides);
        },

        executionInfoJson: function(overrides) {
            return _.extend({
                databaseId: null,
                databaseName: null,
                instanceId: null,
                instanceName: null,
                schemaId: null,
                schemaName: null
            }, overrides);
        },

        workfileDraft: function() {
            return {
                content : 'draft!',
                baseVersionNum : 1,
                draftOwner : 'edcadmin',
                draftFileId : this.nextId().toString(),
                isDeleted : false
            }
        },

        workfileJson: function(overrides) {
            var id = this.nextId().toString();
            var name = 'Workfile ' + id;
            var modifiedByUser = this.userJson();
            var ownerUser = this.userJson();
            return _.extend({
                id : id,
                fileName: name,
                fileType: "txt",
                mimeType: "text/plain",
                versionInfo: this.versionInfoJson(overrides && overrides.versionInfo, modifiedByUser),
                executionInfo : this.executionInfoJson(overrides && overrides.executionInfo),
                latestVersionNum: 1,
                recentComments: [
                    fixtures.activities.NOTE_ON_WORKFILE_JSON(),
                    fixtures.activities.NOTE_ON_WORKFILE_JSON()
                ],
                commentCount: 2,
                draftInfo: {
                    content : null,
                    baseVersionNum : null,
                    draftOwner : null,
                    draftFileId : null,
                    isDeleted : null
                },
                hasDraft: false,
                isDeleted: false,
                modifiedByFirstName: modifiedByUser.firstName,
                modifiedByLastName: modifiedByUser.lastName,
                modifiedById: modifiedByUser.id,
                modifiedBy: modifiedByUser.userName,
                owner: ownerUser.userName,
                ownerId: ownerUser.id,
                workspaceId: this.nextId().toString(),
                imageId : null,
                isBinary: false,
                source: "empty",
                lastUpdatedStamp: "2011-11-29 10:46:03.152",
                createdStamp: "2011-11-29 10:46:03.152"
            }, overrides);
        },

        workspaceJson: function() {
            var id = this.nextId();
            var databaseId = this.nextId();
            var instanceId = this.nextId();
            var schemaId = this.nextId();
            return {
                id : id.toString(),
                name : 'Workspace ' + id,
                ownerId : this.nextId().toString(),
                ownerFirstName : "Dr",
                ownerLastName : "Mario",
                "sandboxInfo": {
                    databaseId: databaseId,
                    databaseName: 'database'+databaseId,
                    instanceId: instanceId,
                    instanceName: 'instance'+instanceId,
                    sandboxId: this.nextId().toString(),
                    schemaId: schemaId,
                    schemaName: 'schema'+schemaId
                }
            }
        },

        user: function(overrides) {
            var id = this.nextId().toString();
            return new chorus.models.User(this.userJson(_.extend({
                admin : true,
                use_external_ldap : false
            }, overrides)));
        },

        comment: function(overrides) {
            var id = this.nextId().toString();
            var attributes = _.extend({
                id : id,
                text : "this is comment text" + id,
                artifacts : [],
                timestamp : '2011-01-01 12:00:00'
            }, overrides);
            attributes.author = _.extend(this.user().attributes, overrides && overrides.author);
            return new chorus.models.Comment(attributes);
        },

        database: function(overrides) {
            return new chorus.models.Database(this.databaseJson(overrides));
        },

        activity: function(overrides) {
            return new chorus.models.Activity(this.activityJson(overrides));
        },

        noteComment: function(overrides) {
            commentOverrides = _.extend({
                comments: [],
                attachments : [],
                entityType: 'instance',
                entityId: this.nextId().toString(),
                type: "NOTE",
                workspace: fixtures.workspace()
            }, overrides)
            return fixtures.comment(commentOverrides);
        },

        schemaSet: function(overrides) {
            var attributes = _.extend({
                id : this.nextId().toString(),
                databaseId: this.nextId().toString(),
                instanceId : this.nextId().toString(),
                databaseName: "My fixture database"
            }, overrides);
            return new chorus.collections.SchemaSet([], attributes);
        },

        schema: function(overrides) {
            var id = this.nextId().toString();

            var attributes = _.extend({
                id : id,
                name : "Schema_" + id,
                lastUpdatedStamp : "2012-01-04 14:42:15.318",
                lastUpdatedTxStamp : "2012-01-04 14:42:15.309",
                createdStamp : "2012-01-04 14:42:15.318",
                createdTxStamp : "2012-01-04 14:42:15.309",
                instanceId : this.nextId().toString(),
                databaseName: "My fixture database"
            }, overrides);
            return new chorus.models.Schema(attributes);
        },

        databaseObjectJson: function(overrides) {
            var id = this.nextId().toString();
            return _.extend(this.tabularDataJson(), {
                objectType: "BASE_TABLE",
                rows : 500,
                columns : 3,
                onDiskSize : "64 kB",
                lastAnalyzedTime : "2012-01-18 13:43:31.70468",
                masterTable : null,
                partitions : 0,
                hasData : true,
                desc : null,
                type : "SOURCE_TABLE",
                databaseName : "database_name",
                schemaName : "schema_name",
                workspaceUsed:
                {
                    workspaceCount: 0,
                    workspaceList: [ ]
                },
                columnNames: [
                    "col1",
                    "col2",
                    "col3"
                ]
            }, overrides);
        },

        databaseObject: function(overrides) {
            var id = this.nextId().toString();
            var attributes = _.extend(this.tabularDataJson(), this.databaseObjectJson(), overrides);
            return new chorus.models.DatabaseObject(attributes);
        },

        databaseObjectAsTable: function(overrides) {
            var id = this.nextId().toString();
            var attributes = _.extend(this.databaseObjectJson(), {
                objectType: "BASE_TABLE",
                type : "SOURCE_TABLE"
            }, overrides);
            return new chorus.models.DatabaseObject(attributes);
        },


        databaseObjectAsView: function(overrides) {
            var id = this.nextId().toString();
            var attributes = _.extend(this.databaseObjectJson(), {
                objectType: "VIEW",
                type : "SOURCE_TABLE",
                definition : "SELECT chorus_test_table.customer_id FROM ddemo.chorus_test_table;"
            }, overrides);
            return new chorus.models.DatabaseObject(attributes);
        },

        databaseTable: function(overrides) {
            var id = this.nextId().toString();
            var attributes = _.extend(this.databaseObjectJson(), {
                objectType: "BASE_TABLE",
                type : "SOURCE_TABLE"
            }, overrides);
            return new chorus.models.DatabaseTable(attributes);
        },

        databaseView: function(overrides) {
            var id = this.nextId().toString();
            var attributes = _.extend(this.databaseObjectJson(), {
                objectType: "VIEW",
                type : "SOURCE_TABLE",
                definition : "SELECT chorus_test_table.customer_id FROM ddemo.chorus_test_table;"
            }, overrides);
            return new chorus.models.DatabaseView(attributes);
        },

        databaseColumn: function(overrides) {
            var id = this.nextId().toString();
            var attributes = _.extend({
                name : "column_name_" + id,
                typeCategory : "WHOLE_NUMBER"
            }, overrides);
            return new chorus.models.DatabaseColumn(attributes);
        },

        databaseTableSet: function(models, overrides) {
            var id = this.nextId().toString()
            models = (models && (models.length > 0)) || [this.table(overrides), this.table(overrides)];
            return new chorus.collections.DatabaseTableSet(models, overrides);
        },

        databaseViewSet: function(models, overrides) {
            var id = this.nextId().toString()
            models = (models && (models.length > 0)) || [this.databaseView(overrides), this.databaseView(overrides)];
            return new chorus.collections.DatabaseViewSet(models, overrides);
        },

        databaseColumnSet: function(models, overrides) {
            var id = this.nextId().toString()
            models = (models && (models.length > 0)) ? models : [this.databaseColumn(overrides), this.databaseColumn(overrides)];
            var attributes = _.extend({
                tableName : "Table" + id
            }, overrides);
            var collection = new chorus.collections.DatabaseColumnSet([], attributes);
            collection.reset(models)
            return collection;
        },

        workspace: function(overrides) {
            var id = this.nextId().toString()
            var attributes = _.extend(this.workspaceJson(), {
                _owner: this.user()
            }, overrides);
            return new chorus.models.Workspace(attributes);
        },

        workfile: function(overrides) {
            var attributes = this.workfileJson(overrides);
            return new chorus.models.Workfile(attributes);
        },

        draft: function(overrides) {
            var attributes = _.extend({draftInfo: this.workfileDraft(), hasDraft: true}, overrides);
            return new chorus.models.Draft(this.workfileJson(attributes));
        },

        textWorkfile: function(overrides) {
            overrides = _.extend({
                mimeType: "text/plain",
                fileType: "txt"
            }, overrides);
            return this.workfile(overrides);
        },

        imageWorkfile: function(overrides) {
            overrides = _.extend({
                mimeType: "image/jpeg",
                fileName: "avatar.jpg"
            }, overrides);
            return this.workfile(overrides);
        },

        otherWorkfile: function(overrides) {
            overrides = _.extend({
                fileType: "N/A",
                fileName: "zipfile.zip",
                mimeType: "application/zip"
            }, overrides);
            return this.workfile(overrides);
        },

        sqlWorkfile: function(overrides) {
            overrides = _.extend({
                fileName : "sample.sql",
                fileType : "SQL",
                mimeType : "text/x-sql"
            }, overrides);
            return this.workfile(overrides);
        },

        workfileSet: function(models) {
            models = models || [this.workfile(), this.workfile()];
            return new chorus.collections.WorkfileSet(models);
        },

        artifact: function(overrides) {
            var attributes = _.extend({
                id: this.nextId().toString(),
                entityType: "file"
            }, overrides);
            return new chorus.models.Artifact(attributes);
        },

        instance : function(overrides) {
            var attributes = _.extend(this.instanceJson(), {
                description: "description for jasmine",
                expire: null,
                freeSpace: null,
                host: "localhost",
                instanceProvider: "Greenplum Database",
                instanceVersion: null,
                isDeleted: false,
                lastCheck: null,
                owner: "edcadmin",
                ownerId: this.nextId().toString(),
                ownerFullName: "EDC Admin",
                port: 8020,
                provisionName: null,
                provisionType: null,
                sharedAccount: {},
                size: null,
                state: "online",
                totalObject: null
            }, overrides);
            return new chorus.models.Instance(attributes);
        },

        instanceWithSharedAccount: function(overrides) {
            var instance = this.instance(_.extend({
                sharedAccount : {
                    dbUserName : "gpadmin"
                }
            }, overrides));
            return instance;
        },

        emptyInstanceAccount: function(overrides) {
            var attributes = _.extend({
                instanceId: "10020",
                userName: "u1"
            }, overrides);
            return new chorus.models.InstanceAccount(attributes);
        },

        instanceAccount : function(overridesOrInstance) {
            var overrides;
            if (overridesOrInstance instanceof chorus.models.Instance) {
                overrides = {
                    instanceId: overridesOrInstance.get("id"),
                    dbUserName: overridesOrInstance.get("sharedAccount").dbUserName
                };
            } else {
                overrides = overridesOrInstance || {};
            }
            var attributes = _.extend({
                id : this.nextId().toString(),
                shared : "yes",
                expiration : null,
                instanceId : this.nextId().toString(),
                user : _.extend(this.userJson(), overrides.user),
                dbUserName : "gpadmin"
            }, overrides);
            return new chorus.models.InstanceAccount(attributes);
        },

        instanceAccountSet: function(models) {
            models = models || [this.instanceAccount(), this.instanceAccount()];
            return new chorus.collections.InstanceAccountSet(models);
        },

        instanceUsage : function() {
            return new chorus.models.InstanceUsage({
                "sandboxesSize" : "2.9GB",
                "sandboxesSizeInBytes" : 3157917696,
                "workspaces" : [
                    this.instanceWorkspaceUsageJson({
                        sizeInBytes:"1648427008"
                    }),
                    this.instanceWorkspaceUsageJson({
                        sizeInBytes:"1509490688"
                    })
                ]
            });
        },

        sandbox: function(overrides) {
            var databaseId = this.nextId().toString();
            var instanceId = this.nextId().toString();
            var schemaId = this.nextId().toString();
            var attributes = _.extend({
                id: this.nextId().toString(),
                databaseId: databaseId,
                databaseName: "database" + databaseId,
                instanceId: instanceId,
                instanceName: "instance" + instanceId,
                instanceStatus: "online",
                schemaId: schemaId,
                schemaName: "schema" + schemaId,
                status: "ok",
                type: "000",
                workspaceId: this.nextId().toString()
            }, overrides);
            return new chorus.models.Sandbox(attributes);
        },

        tabularDataJson: function(overrides) {
            var id = fixtures.nextId();
            return _.extend({
                databaseName: "dca_demo",
                instance: {id:fixtures.nextId(), name:"some_instance"},
                objectName : "Dataset" + id,
                schemaName: "some_schema",
                recentComment : fixtures.activities.NOTE_ON_DATASET(),
                commentCount: 1
            }, overrides);
        },

        datasetCommonJson : function(overrides) {
            var id = fixtures.nextId();
            var attributes = _.extend(this.tabularDataJson(), {
                isDeleted: false,
                hasCredentials: true,
                owner: {id: "InitialUser", userName: "edcadmin"},
                modifiedBy: {id: "InitialUser", userName: "edcadmin"},
                workspace: {id: fixtures.nextId(), name: "some_workspace"},
                workspaceUsed: {
                    workspaceCount: 1,
                    workspaceList: [fixtures.workspaceJson()]
                }
            }, overrides);
            attributes.id = [
                attributes.instance.id,
                attributes.databaseName,
                attributes.schemaName,
                attributes.objectType,
                attributes.objectName
            ].join("|");
            return attributes;
        },

        datasetChorusView : function(overrides) {
            var attributes = _.extend(fixtures.datasetCommonJson(overrides), {
                createdStamp: "2012-01-24 12:25:46.994",
                createdTxStamp: "2012-01-24 12:25:46.627",
                lastUpdatedStamp: "2012-01-24 12:25:46.994",
                lastUpdatedTxStamp: "2012-01-24 12:25:46.627",
                objectType: "",
                query: "select * from cust",
                type: "CHORUS_VIEW"
            }, overrides);
            return new chorus.models.Dataset(attributes);
        },

        datasetStatisticsView : function(overrides) {
            var attributes = _.extend(fixtures.datasetCommonJson(overrides), {
                createdStamp: "2012-01-24 12:25:11.077",
                createdTxStamp: "2012-01-24 12:25:10.701",
                id: fixtures.nextId().toString(),
                lastUpdatedStamp: "2012-01-24 12:25:11.077",
                lastUpdatedTxStamp: "2012-01-24 12:25:10.701",
                objectType: "VIEW",
                type: "SOURCE_TABLE",
                definition: "DROP TABLE users"
            }, overrides);
            return new chorus.models.DatabaseObjectStatistics(attributes);
        },

        datasetStatisticsTable : function(overrides) {
            var attributes = _.extend(fixtures.datasetCommonJson(overrides), {
                createdStamp: "2012-01-24 12:25:11.077",
                createdTxStamp: "2012-01-24 12:25:10.701",
                id: fixtures.nextId().toString(),
                lastUpdatedStamp: "2012-01-24 12:25:11.077",
                lastUpdatedTxStamp: "2012-01-24 12:25:10.701",
                objectType: "BASE_TABLE",
                type: "SOURCE_TABLE"
            }, overrides);
            return new chorus.models.DatabaseObjectStatistics(attributes);
        },

        datasetSourceView : function(overrides) {
            var attributes = _.extend(fixtures.datasetCommonJson(overrides), {
                createdStamp: "2012-01-24 12:25:11.077",
                createdTxStamp: "2012-01-24 12:25:10.701",
                lastUpdatedStamp: "2012-01-24 12:25:11.077",
                lastUpdatedTxStamp: "2012-01-24 12:25:10.701",
                objectType: "VIEW",
                type: "SOURCE_TABLE"
            }, overrides);
            return new chorus.models.Dataset(attributes);
        },

        datasetSourceTable : function(overrides) {
            var attributes = _.extend(fixtures.datasetCommonJson(overrides), {
                createdStamp: "2012-01-24 12:25:11.077",
                createdTxStamp: "2012-01-24 12:25:10.701",
                lastUpdatedStamp: "2012-01-24 12:25:11.077",
                lastUpdatedTxStamp: "2012-01-24 12:25:10.701",
                objectType: "BASE_TABLE",
                type: "SOURCE_TABLE"
            }, overrides);
            return new chorus.models.Dataset(attributes);
        },

        datasetSandboxTable : function(overrides) {
            var attributes = _.extend(fixtures.datasetCommonJson(overrides), {
                modifiedBy: {},
                objectType: "BASE_TABLE",
                owner: {},
                type: "SANDBOX_TABLE"
            }, overrides);
            return new chorus.models.Dataset(attributes);
        },
        
        datasetPreview: function(overrides) {
            return new chorus.models.TabularDataPreview(_.extend({
                columns: [],
                rows: []
            }, overrides));
        },

        chartTask: function(overrides) {
            return new chorus.models.ChartTask(_.extend({
                columns: [],
                rows: []
            }, overrides));
        },

        csvImport: function(overrides) {
            var attributes = _.extend({
                lines: [
                    "col1,col2,col3",
                    "val1,val2,val3"
                ],
                fileName: "/file.csv"
            }, overrides)
            return new chorus.models.CSVImport(attributes);
        },

        datasetHadoopExternalTable : function(overrides) {
            var attributes = _.extend(fixtures.datasetCommonJson(overrides), {
                modifiedBy: {},
                objectType: "HDFS_EXTERNAL_TABLE",
                owner: {},
                type: "SANDBOX_TABLE"
            }, overrides);
            return new chorus.models.Dataset(attributes);
        },
        
        schemaFunction: function(overrides) {
            var attributes = _.extend({
                argTypes : ['text','text','text'],
                argNames : ['first_name', 'last_name', ''],
                language : "plpgsql",
                functionName : "function" + this.nextId().toString(),
                schemaName : 'mmmmySchema',
                returnType : "void"
            }, overrides);
            return new chorus.models.SchemaFunction(attributes);
        },

        tabularData: function(overrides) {
            return new chorus.models.TabularData(this.tabularDataJson(_.extend({
                objectType: "BASE_TABLE",
                type: "SANDBOX_TABLE"
            }, overrides)));
        },

        task: function(overrides) {
            var id = this.nextId().toString();
            return new chorus.models.SqlExecutionTask(_.extend({
                id : this.nextId().toString()
            }, overrides));
        },

        taskWithResult: function(overrides) {
            overrides = _.extend({ result: {
                columns: [
                    { name: "id" },
                    { name: "city" },
                    { name: "state" },
                    { name: "zip" }
                ],
                rows: [
                    { id: 1 , city: "Oakland"   , state: "CA" , zip: "94612" } ,
                    { id: 2 , city: "Arcata"    , state: "CA" , zip: "95521" } ,
                    { id: 3 , city: "Lafayette" , state: "IN" , zip: "47909" }
                ],
                executeResult: "success",
                hasResult: "true",
                message: ""
            }}, overrides);
            return this.task(overrides);
        },

        timeseriesTaskWithResult: function(overrides) {
            var attributes = _.extend({
                objectName: "pirates",
                yAxis: "num_hands",
                xAxis: "per_year",

                columns: [
                    { name: "time", typeCategory: "DATE" },
                    { name: "value",  typeCategory: "WHOLE_NUMBER" }
                ],
                rows: [
                    { time: 1, value: '321' },
                    { time: 2, value: '1024' }
                ]
            }, overrides);
            return new chorus.models.TimeseriesTask(attributes);
        },

        frequencyTaskWithResult: function(overrides) {
            var attributes = _.extend({
                objectName: "pirates",
                yAxis: "num_hands",

                columns: [
                    { name: "bucket", typeCategory: "STRING" },
                    { name: "count",  typeCategory: "WHOLE_NUMBER" }
                ],
                rows: [
                    { bucket: 1, count: '321' },
                    { bucket: 2, count: '1024' }
                ]
            }, overrides);
            return new chorus.models.FrequencyTask(attributes);
        },

        boxplotTaskWithResult: function(overrides) {
            var attributes = _.extend({
                objectName: "pirates",
                xAxis: "gender",
                yAxis: "age",
                columns: [
                    { name: "bucket",        typeCategory: "STRING" },
                    { name: "min",           typeCategory: "REAL_NUMBER" },
                    { name: "median",        typeCategory: "REAL_NUMBER" },
                    { name: "max",           typeCategory: "REAL_NUMBER" },
                    { name: "firstQuartile", typeCategory: "REAL_NUMBER" },
                    { name: "thirdQuartile", typeCategory: "REAL_NUMBER" },
                    { name: "percentage",    typeCategory: "STRING" }
                ],
                rows: [
                    { min: 0, median: 2, max: 4, count: 279089, percentage: '27.9%', bucket: 'FEMALE', firstQuartile: 1, thirdQuartile:  3 },
                    { min: 0, median: 2, max: 4, count: 720911, percentage: '72.1%', bucket: 'MALE', firstQuartile: 1, thirdQuartile:  3 }
                ]
            }, overrides);
            return new chorus.models.BoxplotTask(attributes);
        },

        heatmapTaskWithResult: function(overrides) {
            var attributes = _.extend({
                objectName: "pirates",
                xAxis: "hair_length",
                yAxis: "kill_count",
                xBins: "4",
                yBins: "3",

                columns: [
                    { "name": "x",      "typeCategory": "WHOLE_NUMBER" },
                    { "name": "y",      "typeCategory": "WHOLE_NUMBER" },
                    { "name": "value",  "typeCategory": "REAL_NUMBER" },
                    { "name": "xLabel", "typeCategory": "STRING" },
                    { "name": "yLabel", "typeCategory": "STRING" }
                ],

                rows: [
                    { yLabel: "[30-71.8]",     xLabel: "[0-1.8]",   value: 39541, y: 1, x: 1 },
                    { yLabel: "[71.8-113.6]",  xLabel: "[0-1.8]",   value: 39873, y: 2, x: 1 },
                    { yLabel: "[113.6-155.4]", xLabel: "[0-1.8]",   value: 39993, y: 3, x: 1 },
                    { yLabel: "[30-71.8]",     xLabel: "[1.8-3.6]", value: 39818, y: 1, x: 2 },
                    { yLabel: "[71.8-113.6]",  xLabel: "[1.8-3.6]", value: 39838, y: 2, x: 2 },
                    { yLabel: "[113.6-155.4]", xLabel: "[1.8-3.6]", value: 39911, y: 3, x: 2 },
                    { yLabel: "[30-71.8]",     xLabel: "[3.6-5.4]", value: 39631, y: 1, x: 3 },
                    { yLabel: "[71.8-113.6]",  xLabel: "[3.6-5.4]", value: 40174, y: 2, x: 3 },
                    { yLabel: "[113.6-155.4]", xLabel: "[3.6-5.4]", value: 39700, y: 3, x: 3 },
                    { yLabel: "[30-71.8]",     xLabel: "[5.4-7.2]", value: 40551, y: 1, x: 4 },
                    { yLabel: "[71.8-113.6]",  xLabel: "[5.4-7.2]", value: 40411, y: 2, x: 4 },
                    { yLabel: "[113.6-155.4]", xLabel: "[5.4-7.2]", value: 39841, y: 3, x: 4 }
                ]
            }, overrides);
            return new chorus.models.HeatmapTask(attributes);
        },

        taskWithErrors: function(overrides) {
            var attributes = _.extend({ result: {
                executeResult: "failed",
                hasResult: "false",
                message: 'ERROR: syntax error at or near "where 1=1; drop table users;"  Position: line 1 column 1'
            }}, overrides);
            var task = this.task(attributes);
            task.serverErrors = task.result;
            return task;
        },

        notificationJson : function(overrides) {
            var id = fixtures.nextId();
            return _.extend({
                content: "what an alert!",
                operatorFullName: "Joe Bloggs",
                operator: "joebloggs",
                recipientFullName: "Nancy Schmeigel",
                recipient: "nancy",
                isDeleted: false
            }, overrides);
        },

        notification : function(overrides) {
            return new chorus.models.Notification(this.notificationJson(overrides));
        },

        notificationSet: function(models, overrides) {
            models = (models && (models.length > 0)) || [this.notification(overrides), this.notification(overrides)];
            return new chorus.collections.NotificationSet(models, overrides);
        }
    });
});
