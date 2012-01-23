(function($) {
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

        this.failSaveFor = function(model, message, overrides){
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
                    var klass = chorus.models[model];
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
                var klass = chorus.models[this.model];
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
                            "sandboxId":null,
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
                            "sandboxId":null,
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
                fetch : {
                    "message":[],
                    "status":"ok",
                    "requestId":17,
                    "resource":[
                        {
                            "createdStamp":"2011-11-22",
                            "lastUpdatedStamp":"2011-11-22 14:40:42.11",
                            "modifiedBy":"edcadmin",
                            "ownerFullName":"EDC Admin",
                            "imageId":null,
                            "id":"10020",
                            "fileName":"who.sql",
                            "mimeType":"text/x-sql",
                            "fileType":"sql",
                            "isBinary":false,
                            "workspaceId":"10000",
                            "source":"empty",
                            "owner":"edcadmin",
                            "description":null,
                            "versionNum": 1,
                            "latestVersionNum":1,
                            "versionFileId":"1111_1111",
                            "isDeleted":false,
                            "modifiedByFirstName":"EDC",
                            "modifiedByLastName":"Admin",
                            "modifiedById":"10010",
                            "commentCount":2,
                            "recentComments" : [
                                {
                                    "author" : {
                                        id : "InitialUser",
                                        lastName : "Admin",
                                        firstName : "EDC"
                                    },
                                    "comments" : [],
                                    "id" : 10303,
                                    "text" : "I am loving commenting",
                                    "timestamp" : "2011-11-22 14:40:42",
                                    "type" : "NOTE"
                                }
                            ]
                        }
                    ],
                    "method":"GET",
                    "resourcelink":"/edc/workspace/10000/workfile/10020",
                    "pagination":null,
                    "version":"0.1"
                },

                fetchWithDraft : {
                    "message":[],
                    "status":"ok",
                    "requestId":17,
                    "resource":[
                        {
                            "content" : "draft content",
                            "createdStamp":"2011-11-22",
                            "lastUpdatedStamp":"2011-11-22 14:40:42.11",
                            "modifiedBy":"edcadmin",
                            "ownerFullName":"EDC Admin",
                            "hasDraft" : true,
                            "imageId":null,
                            "id":"10020",
                            "fileName":"who.sql",
                            "mimeType":"text/x-sql",
                            "fileType":"sql",
                            "isBinary":false,
                            "workspaceId":"10000",
                            "source":"empty",
                            "owner":"edcadmin",
                            "description":null,
                            "latestVersionNum":1,
                            "versionNum":1,
                            "versionFileId":"1111_1111",
                            "isDeleted":false,
                            "modifiedByFirstName":"EDC",
                            "modifiedByLastName":"Admin",
                            "modifiedById":"10010",
                            "commentCount":2,
                            "recentComments" : [
                                {
                                    "author" : {
                                        id : "InitialUser",
                                        lastName : "Admin",
                                        firstName : "EDC"
                                    },
                                    "comments" : [],
                                    "id" : 10303,
                                    "text" : "I am loving commenting",
                                    "timestamp" : "2011-11-22 14:40:42",
                                    "type" : "NOTE"
                                }
                            ]
                        }
                    ],
                    "method":"GET",
                    "resourcelink":"/edc/workspace/10000/workfile/10020",
                    "pagination":null,
                    "version":"0.1"
                },
                copy : {
                    "message":[],
                    "status":"ok",
                    "requestId":1137,
                    "resource":[
                        {
                            "fileName":"test.sql",
                            "mimeType":"text/x-sql",
                            "fileType":"sql",
                            "isBinary":false,
                            "workspaceId":"10010",
                            "source":"chorus",
                            "owner":"edcadmin",
                            "description":"null",
                            "latestVersionNum":1,
                            "isDeleted":false,
                            "modifiedBy":"edcadmin",
                            "id":"10026",
                            "lastUpdatedTxStamp":"2011-11-28 13:47:42.245",
                            "createdTxStamp":"2011-11-28 13:47:42.245",
                            "lastUpdatedStamp":"2011-11-28 13:47:42.253",
                            "createdStamp":"2011-11-28 13:47:42.253"
                        }
                    ],
                    "method":"POST",
                    "resourcelink":"/edc/workspace/10010/workfile",
                    "pagination":null,
                    "version":"0.1"
                },

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
                },

                image : {
                    "message": [],
                    "status": "ok",
                    "requestId": 1913,
                    "resource": [
                        {
                            "id": "10035",
                            "fileName": "avatar.jpg",
                            "mimeType": "image/jpeg",
                            "fileType": "N/A",
                            "isBinary": true,
                            "workspaceId": "10000",
                            "source": "fs",
                            "owner": "edcadmin",
                            "description": null,
                            "latestVersionNum": 1,
                            "isDeleted": false,
                            "modifiedBy": "edcadmin",
                            "lastUpdatedStamp": "2011-11-29 10:31:15.153",
                            "lastUpdatedTxStamp": "2011-11-29 10:31:15.143",
                            "createdStamp": "2011-11-29 10:31:15.153",
                            "createdTxStamp": "2011-11-29 10:31:15.143",
                            "versionFileId": "1322591475139_3804",
                            "versionNum": "1",
                            "versionOwner": "edcadmin",
                            "hasDraft": false,
                            "sandboxId": null
                        }
                    ],
                    "method": "GET",
                    "resourcelink": "/edc/workspace/10000/workfile/10035",
                    "pagination": null,
                    "version": "0.1"
                },

                fetchText : {
                    "message":[],
                    "status":"ok",
                    "requestId":449,
                    "resource":[

                        {
                            "id":"10004",
                            "fileName":"editabletextfile.txt",
                            "mimeType":"text/plain",
                            "fileType":"txt",
                            "isBinary":false,
                            "workspaceId":"10001",
                            "source":"fs",
                            "owner":"edcadmin",
                            "description":null,
                            "latestVersionNum":1,
                            "isDeleted":false,
                            "modifiedBy":"edcadmin",
                            "lastUpdatedStamp":"2011-11-29 10:46:03.152",
                            "lastUpdatedTxStamp":"2011-11-29 10:46:03.145",
                            "createdStamp":"2011-11-29 10:46:03.152",
                            "createdTxStamp":"2011-11-29 10:46:03.145",
                            "versionFileId":"1322592363143_7126",
                            "versionNum":"1",
                            "versionOwner":"edcadmin",
                            "content":"This is a text file.\n\nThis is the 3rd line.\n\nReally really long line.  Really really long line.  Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.",
                            "editable":true,
                            "hasDraft":false,
                            "sandboxId":null
                        }
                    ],
                    "method":"GET",
                    "resourcelink":"/edc/workspace/10001/workfile/10004",
                    "pagination":null,
                    "version":"0.1"
                }
            },

            Draft : {
                fetch : {
                    "message":[],
                    "status":"ok",
                    "requestId":17,
                    "resource":[
                        {
                            id : "10001"
                        }
                    ],
                    "method":"GET",
                    "resourcelink":"/edc/workspace/10000/workfile/10020/draft",
                    "pagination":null,
                    "version":"0.1"
                },

                fetchWithDraft : {
                    "message":[],
                    "status":"ok",
                    "requestId":17,
                    "resource":[
                        {
                            "content" : "draft content",
                            "createdStamp":"2011-11-22",
                            "lastUpdatedStamp":"2011-11-22 14:40:42.11",
                            "modifiedBy":"edcadmin",
                            "ownerFullName":"EDC Admin",
                            "hasDraft" : true,
                            "imageId":null,
                            "id":"10020",
                            "fileName":"who.sql",
                            "mimeType":"text/x-sql",
                            "fileType":"sql",
                            "isBinary":false,
                            "workspaceId":"10000",
                            "source":"empty",
                            "owner":"edcadmin",
                            "description":null,
                            "latestVersionNum":1,
                            "versionFileId":"1111_1111",
                            "isDeleted":false,
                            "modifiedByFirstName":"EDC",
                            "modifiedByLastName":"Admin",
                            "modifiedById":"10010",
                            "commentCount":2,
                            "recentComments" : [
                                {
                                    "author" : {
                                        id : "InitialUser",
                                        lastName : "Admin",
                                        firstName : "EDC"
                                    },
                                    "comments" : [],
                                    "id" : 10303,
                                    "text" : "I am loving commenting",
                                    "timestamp" : "2011-11-22 14:40:42",
                                    "type" : "NOTE"
                                }
                            ]
                        }
                    ],
                    "method":"GET",
                    "resourcelink":"/edc/workspace/10000/workfile/10020",
                    "pagination":null,
                    "version":"0.1"
                },
                copy : {
                    "message":[],
                    "status":"ok",
                    "requestId":1137,
                    "resource":[
                        {
                            "fileName":"test.sql",
                            "mimeType":"text/x-sql",
                            "fileType":"sql",
                            "isBinary":false,
                            "workspaceId":"10010",
                            "source":"chorus",
                            "owner":"edcadmin",
                            "description":"null",
                            "latestVersionNum":1,
                            "isDeleted":false,
                            "modifiedBy":"edcadmin",
                            "id":"10026",
                            "lastUpdatedTxStamp":"2011-11-28 13:47:42.245",
                            "createdTxStamp":"2011-11-28 13:47:42.245",
                            "lastUpdatedStamp":"2011-11-28 13:47:42.253",
                            "createdStamp":"2011-11-28 13:47:42.253"
                        }
                    ],
                    "method":"POST",
                    "resourcelink":"/edc/workspace/10010/workfile",
                    "pagination":null,
                    "version":"0.1"
                },

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
                },

                image : {
                    "message": [],
                    "status": "ok",
                    "requestId": 1913,
                    "resource": [
                        {
                            "id": "10035",
                            "fileName": "avatar.jpg",
                            "mimeType": "image/jpeg",
                            "fileType": "N/A",
                            "isBinary": true,
                            "workspaceId": "10000",
                            "source": "fs",
                            "owner": "edcadmin",
                            "description": null,
                            "latestVersionNum": 1,
                            "isDeleted": false,
                            "modifiedBy": "edcadmin",
                            "lastUpdatedStamp": "2011-11-29 10:31:15.153",
                            "lastUpdatedTxStamp": "2011-11-29 10:31:15.143",
                            "createdStamp": "2011-11-29 10:31:15.153",
                            "createdTxStamp": "2011-11-29 10:31:15.143",
                            "versionFileId": "1322591475139_3804",
                            "versionNum": "1",
                            "versionOwner": "edcadmin",
                            "hasDraft": false,
                            "sandboxId": null
                        }
                    ],
                    "method": "GET",
                    "resourcelink": "/edc/workspace/10000/workfile/10035",
                    "pagination": null,
                    "version": "0.1"
                },

                fetchText : {
                    "message":[],
                    "status":"ok",
                    "requestId":449,
                    "resource":[

                        {
                            "id":"10004",
                            "fileName":"editabletextfile.txt",
                            "mimeType":"text/plain",
                            "fileType":"txt",
                            "isBinary":false,
                            "workspaceId":"10001",
                            "source":"fs",
                            "owner":"edcadmin",
                            "description":null,
                            "latestVersionNum":1,
                            "isDeleted":false,
                            "modifiedBy":"edcadmin",
                            "lastUpdatedStamp":"2011-11-29 10:46:03.152",
                            "lastUpdatedTxStamp":"2011-11-29 10:46:03.145",
                            "createdStamp":"2011-11-29 10:46:03.152",
                            "createdTxStamp":"2011-11-29 10:46:03.145",
                            "versionFileId":"1322592363143_7126",
                            "versionNum":"1",
                            "versionOwner":"edcadmin",
                            "content":"This is a text file.\n\nThis is the 3rd line.\n\nReally really long line.  Really really long line.  Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.Really really long line.",
                            "editable":true,
                            "hasDraft":false,
                            "sandboxId":null
                        }
                    ],
                    "method":"GET",
                    "resourcelink":"/edc/workspace/10001/workfile/10004",
                    "pagination":null,
                    "version":"0.1"
                }
            },

            WorkfileSet : {
                fetch : {
                    "message" : [ ],
                    "status" : "ok",
                    "requestId" : 256,
                    "resource" : [
                        {
                            "createdStamp":"2011-10-22",
                            "lastUpdatedStamp":"2011-10-22 14:40:42.11",
                            "modifiedBy":"edcadmin",
                            "ownerFullName":"EDC Admin",
                            "imageId":null,
                            "id":"10020",
                            "fileName":"who.sql",
                            "mimeType":"text/x-sql",
                            "fileType":"sql",
                            "isBinary":false,
                            "workspaceId":"10000",
                            "source":"empty",
                            "owner":"edcadmin",
                            "description":null,
                            "latestVersionNum":1,
                            "versionFileId":"1111_1111",
                            "isDeleted":false,
                            "modifiedByFirstName":"EDC",
                            "modifiedByLastName":"Admin",
                            "modifiedById":"10010",
                            "commentCount":2,
                            "recentComments" : [
                                {
                                    "author" : {
                                        id : "InitialUser",
                                        lastName : "Admin",
                                        firstName : "EDC"
                                    },
                                    "comments" : [],
                                    "id" : 10303,
                                    "text" : "I am loving commenting",
                                    "timestamp" : "2011-11-22 14:40:42",
                                    "type" : "NOTE"
                                }
                            ]
                        },
                        {
                            "createdStamp":"2011-11-22",
                            "lastUpdatedStamp":"2011-11-22 14:40:42.11",
                            "modifiedBy":"edcadmin",
                            "ownerFullName":"Joe Blow",
                            "imageId":null,
                            "id":"10021",
                            "fileName":"what.sql",
                            "mimeType":"text/plain",
                            "fileType":"txt",
                            "isBinary":false,
                            "workspaceId":"10000",
                            "source":"empty",
                            "owner":"joeblow",
                            "description":null,
                            "latestVersionNum":1,
                            "versionFileId":"1111_1111",
                            "isDeleted":false,
                            "modifiedByFirstName":"Joe",
                            "modifiedByLastName":"Blow",
                            "modifiedById":"10011",
                            "commentCount":0,
                            "recentComments" : []
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
                        id: "10860",
                        workfile : fixtures.workfileJson(),
                        workspace : fixtures.workspaceJson(),
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
                        id: "10860",
                        commitMessage: "make file better",
                        version: "3",
                        workfile : fixtures.workfileJson(),
                        workspace : fixtures.workspaceJson(),
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

                "NOTE_ON_WORKFILE" : function() {
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
                        workfile : fixtures.workfileJson(),
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

            userJson: function(overrides) {
                var id = this.nextId().toString();
                return _.extend({
                    id : id,
                    userName : "user" + id,
                    firstName : "EDC" + id,
                    lastName : "Admin" + id
                }, overrides)
            },

            workfileJson: function(overrides) {
                var id = this.nextId().toString();
                var name = 'Workfile ' + id;
                var modifiedByUser = this.userJson();
                return _.extend({
                    id : id,
                    name : name,
                    fileName: name,
                    mimeType: "text/plain",
                    fileType: "txt",
                    isBinary: false,
                    workspaceId: this.nextId().toString(),
                    source: "fs",
                    owner: "edcadmin",
                    description: null,
                    latestVersionNum: 1,
                    isDeleted: false,
                    modifiedBy: modifiedByUser.userName,
                    modifiedByFirstName: modifiedByUser.firstName,
                    modifiedByLastName: modifiedByUser.lastName,
                    modifiedById: modifiedByUser.id,
                    lastUpdatedStamp: "2011-11-29 10:46:03.152",
                    lastUpdatedTxStamp: "2011-11-29 10:46:03.145",
                    createdStamp: "2011-11-29 10:46:03.152",
                    createdTxStamp: "2011-11-29 10:46:03.145",
                    versionFileId: this.nextId().toString(),
                    versionNum: "1",
                    versionOwner: "edcadmin",
                    content: "Workfile Content!" + id,
                    editable: true,
                    hasDraft: false,
                    sandboxId: this.nextId().toString(),
                    recentComments: [
                        this.commentJson(),
                        this.commentJson()
                    ]
                }, overrides);
            },

            draftJson: function(overrides) {
                return _.extend({
                    content: "Some Content",
                    createdStamp: "2012-01-17 16:17:26.439",
                    createdTxStamp: "2012-01-17 16:17:26.411",
                    draftFileId: "1326845846420_8660",
                    draftOwner: "edcadmin",
                    id: this.nextId().toString(),
                    isDeleted: false,
                    lastUpdatedStamp: "2012-01-17 16:17:26.439",
                    lastUpdatedTxStamp: "2012-01-17 16:17:26.411",
                    workfileId: this.nextId().toString(),
                    workspaceId : this.nextId().toString()
                }, overrides);
            },

            workspaceJson: function() {
                var id = this.nextId();
                return {
                    id : id.toString(),
                    name : 'Workspace ' + id
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

            databaseTable: function(overrides) {
                var id = this.nextId().toString();
                var attributes = _.extend({
                    name : "campaign_dim",
                    rows : 500,
                    columns : 6,
                    onDiskSize : "64 kB",
                    lastAnalyzedTime : "2012-01-18 13:43:31.70468",
                    imports : null,
                    masterTable : null,
                    partitions : 0,
                    hasData : true,
                    desc : null,
                    type : "table",
                    instanceId : this.nextId().toString(),
                    databaseName : "table databaseName from fixture",
                    schemaName : "table schemaName from fixture"
                }, overrides);
                return new chorus.models.DatabaseTable(attributes);
            },

            databaseView: function(overrides) {
                var id = this.nextId().toString();
                var attributes = _.extend({
                    name : "view name from fixture"
                }, overrides);
                return new chorus.models.DatabaseView(attributes);
            },

            databaseTableSet: function(models, overrides) {
                var id = this.nextId().toString()
                models = (models && (models.length > 0)) || [this.table(overrides), this.table(overrides)];
                return new chorus.models.DatabaseTableSet(models, overrides);
            },

            databaseViewSet: function(models, overrides) {
                var id = this.nextId().toString()
                models = (models && (models.length > 0)) || [this.databaseView(overrides), this.databaseView(overrides)];
                return new chorus.models.DatabaseViewSet(models, overrides);
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

            textWorkfile: function(overrides) {
                overrides = _.extend({
                    mimeType: "text/plain",
                    fileType: "txt"
                }, overrides);
                return this.workfile(overrides);
            },

            sqlWorkfile: function(overrides) {
                overrides = _.extend({
                    mimeType: "text/x-sql",
                    fileType: "SQL"
                }, overrides);
                return this.workfile(overrides);
            },

            sqlWorkfile: function(overrides) {
                return this.textWorkfile(_.extend({
                    fileName : "sample.sql",
                    fileType : "SQL",
                    mimeType : "text/x-sql"
                }, overrides));
            },

            draft: function(overrides) {
               var attributes = _.extend(this.draftJson(), {
                }, overrides);
                return new chorus.models.Draft(attributes);
            },

            workfileSet: function(models) {
                models = models || [this.workfile(), this.workfile()];
                return new chorus.models.WorkfileSet(models);
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
                return new chorus.models.InstanceAccountSet(models);
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

            schemaFunction: function(overrides) {
                var attributes = _.extend({
                    argTypes : "{text,text,text}",
                    argNames : null,
                    language : "plpgsql",
                    functionName : "function" + this.nextId().toString(),
                    returnType : "void"
                }, overrides);
                return new chorus.models.SchemaFunction(attributes);
            },

            task: function(overrides) {
                var id = this.nextId().toString();
                return new chorus.models.Task(_.extend({
                    id : this.nextId().toString()
                }, overrides));
            },

            taskWithResult: function(overrides) {
                overrides = _.extend({ result: {
                    columns: [{ name: "id" }, { name: "city" }, { name: "state" }, { name: "zip" }],
                    rows: [
                        { id: 1 , city: "Oakland"   , state: "CA" , zip: "94612" } ,
                        { id: 2 , city: "Arcata"    , state: "CA" , zip: "95521" } ,
                        { id: 3 , city: "Lafayette" , state: "IN" , zip: "47909" }
                    ]
                }}, overrides);
                return this.task(overrides);
            }
        });
    });
})(jQuery);
