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

            Login: {
                save: {
                    "message":
                    [

                    ],
                    "status": "ok",
                    "requestId": 4,
                    "resource":
                    [
                    {
                        "userName": "edcadmin",
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
            }
        });
    });
})(jQuery);

