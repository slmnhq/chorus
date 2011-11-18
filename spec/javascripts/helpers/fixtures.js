(function($) {
    beforeEach(function() {
        this.prepareResponse = function(responseJSON) {
            return [200, {
                'Content-Type': 'application/json'
            },
            JSON.stringify(responseJSON)];
        };

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
                        return new klass(data, options);
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
                    return new klass(data, options);
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
                            "id":"InitialUser",
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
                            "techniques":null,
                            "expertise":null,
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
                            "userName": "edcadmin",
                            "firstName": "EDC",
                            "lastName": "Admin",
                            "fullName": "EDC Admin",
                            "emailAddress": "edcadmin@greenplum.com",
                            "admin": true,
                            "techniques": null,
                            "expertise": null,
                            "lastLogin": "2011-11-03 17:45:39",
                            "isDeleted": false
                        },
                        {
                            "userName": "markr",
                            "firstName": "Mark",
                            "lastName": "Rushakoff",
                            "fullName": "Mark Rushakoff",
                            "emailAddress": "markymark@pivotallabs.com",
                            "admin": false,
                            "techniques": null,
                            "expertise": null,
                            "lastLogin": "2011-11-03 17:45:39",
                            "isDeleted": false
                        }
                    ],
                    "method": "GET",
                    "resourcelink": "/edc/user/",
                    "pagination": {
                        "total": "2",
                        "page": "1",
                        "records": "2"
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
                            "summary":null,
                            "sandboxId":null,
                            "active":true,
                            "permission":["admin"]
                        }
                    ],
                    "method":"GET",
                    "resourcelink":"/edc/workspace/10013",
                    "pagination":null,
                    "version":"0.1"
                }
            }

        });
    });
})(jQuery);
