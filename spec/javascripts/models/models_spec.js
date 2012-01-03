describe("chorus.models", function() {
    describe("Base", function() {
        beforeEach(function() {
            this.model = new chorus.models.Base({ id: "foo"});
            this.model.urlTemplate = "my_items/{{id}}";
        });

        describe("#url", function() {

            context("when the model's urlTemplate is a function", function() {
                beforeEach(function() {
                    this.model.urlTemplate = function() { return "my_other_items/{{id}}" };
                });

                it("uses the function's return value", function() {
                    expect(this.model.url()).toBe("/edc/my_other_items/foo");
                });
            });

            it("compiles the urlTemplate and renders it with model attributes", function() {
                expect(this.model.url()).toBe("/edc/my_items/foo");
            });

            context("when the model has additional url params", function() {
                beforeEach(function() {
                    this.model.urlParams = { dance: "the thizzle" }
                });

                it("url-encodes the params and appends them to the url", function() {
                    expect(this.model.url()).toBe("/edc/my_items/foo?dance=the+thizzle");
                });

                context("when the base url template includes a query string", function() {
                    beforeEach(function() {
                        this.model.urlTemplate = "my_items/{{id}}?size=medium";
                    });

                    it("merges the query strings properly", function() {
                        expect(this.model.url()).toBe("/edc/my_items/foo?size=medium&dance=the+thizzle");
                    });
                });
            });
        });

        describe("#showUrl", function() {
            it("returns #/{{showUrlTemplate}}", function() {
                this.model.showUrlTemplate = "my_items/show/{{id}}";
                expect(this.model.showUrl()).toBe("#/my_items/show/foo")
            });

            it("throws when showUrlTemplate is not set", function() {
                expect(this.model.showUrl).toThrow("No showUrlTemplate defined");
            });
        });

        describe("activities", function() {
            it("throws when the model does not have an entityType", function() {
                try {
                    this.models.activities();
                    expect('never').toBe('here');
                } catch (e) {
                    // test passed
                }
            });

            context("with an entityType", function() {
                beforeEach(function() {
                    this.model.entityType = "some_entity";
                    this.model.set({id: "1"});
                    this.activitySet = this.model.activities();
                });

                it("has the right 'entityType' and 'entityId'", function() {
                    expect(this.activitySet.attributes.entityType).toBe("some_entity");
                    expect(this.activitySet.attributes.entityId).toBe("1");
                });

                it("returns the same activities object over each call", function() {
                    expect(this.model.activities()).toBe(this.activitySet);
                });

                describe("when the model is invalidated", function() {
                    beforeEach(function() {
                        this.model.trigger("invalidated");
                    });

                    it("fetches the activities", function() {
                        expect(_.last(this.server.requests).url).toBe(this.activitySet.url());
                    });
                });
            });
        });

        describe("#isValid", function() {
            it("returns true when the errors hash is empty", function() {
                this.model.errors = {'foo': "your foo is dumb"};
                expect(this.model.isValid()).toBeFalsy();
            });

            it("returns true when the errors hash is not empty", function() {
                this.model.errors = {};
                expect(this.model.isValid()).toBeTruthy();
            });

            it("returns true when the errors hash is falsy", function() {
                this.model.errors = undefined;
                expect(this.model.isValid()).toBeTruthy();
            });
        });

        describe("#save", function() {
            describe("with valid model data", function () {
                beforeEach(function() {
                    this.validatedSpy = jasmine.createSpy();
                    this.model.bind("validated", this.validatedSpy);
                    this.model.save();
                    this.savedSpy = jasmine.createSpy();
                    this.saveFailedSpy = jasmine.createSpy();
                    this.model.bind("saved", this.savedSpy);
                    this.model.bind("saveFailed", this.saveFailedSpy);
                });

                it("triggers the validated event", function() {
                    expect(this.validatedSpy).toHaveBeenCalled();
                })

                describe("when the request succeeds", function() {
                    beforeEach(function() {
                        this.response = { status: "ok", resource : [
                            { foo : "hi" }
                        ] };

                        this.server.respondWith(
                            'PUT',
                            '/edc/my_items/foo',
                            this.prepareResponse(this.response));

                        this.server.respond();
                    });

                    it("triggers a saved event", function() {
                        expect(this.savedSpy).toHaveBeenCalled();
                    })
                });

                describe("when the request fails", function() {
                    beforeEach(function() {

                        this.response = { status: "fail", message : [
                            { message : "hi" },
                            { message : "bye" }
                        ] };
                        this.server.respondWith(
                            'PUT',
                            '/edc/my_items/foo',
                            this.prepareResponse(this.response));
                        this.server.respond();

                    });

                    it("returns the error information", function() {
                        expect(this.model.serverErrors).toEqual(this.response.message);
                    })

                    it("triggers a saveFailed event", function() {
                        expect(this.saveFailedSpy).toHaveBeenCalled();
                    })
                });

                describe("and then another request succeeds", function() {
                    beforeEach(function() {
                        this.response = { status: "ok", resource : [
                            { foo : "hi" }
                        ] };

                        this.server.respondWith(
                            'PUT',
                            '/edc/my_items/foo',
                            this.prepareResponse(this.response));

                        this.server.respond();
                    });

                    it("triggers a saved event", function() {
                        expect(this.savedSpy).toHaveBeenCalled();
                    })
                })

                describe("when the request fails on the server", function() {
                    beforeEach(function() {

                        this.response = { status: "fail", message : [
                            { message : "hi" },
                            { message : "bye" }
                        ] };
                        this.server.respondWith(
                            'PUT',
                            '/edc/my_items/foo',
                            this.prepareResponse(this.response));
                        this.server.respond();

                    });

                    it("returns the error information", function() {
                        expect(this.model.serverErrors).toEqual(this.response.message);
                    })

                    describe("and then another request succeeds", function() {
                        beforeEach(function() {
                            this.response = { status: "ok", resource : [
                                { foo : "hi" }
                            ] };

                            this.server = sinon.fakeServer.create();
                            this.server.respondWith(
                                'PUT',
                                '/edc/my_items/foo',
                                this.prepareResponse(this.response));

                            this.model.save();
                            this.server.respond();
                        });
                        it("should trigger the saved event", function() {
                            expect(this.savedSpy).toHaveBeenCalled();
                        });

                        it("clears the error information", function() {
                            expect(this.model.serverErrors).toBeUndefined();
                        })
                    })
                })
            })

            describe("when the model is invalid", function() {
                beforeEach(function() {
                    this.model.performValidation = function() {
                        return false;
                    }
                    this.savedSpy = jasmine.createSpy();
                    this.model.bind("saved", this.savedSpy);
                    this.validationFailedSpy = jasmine.createSpy();
                    this.model.bind("validationFailed", this.validationFailedSpy);
                    spyOn(Backbone.Model.prototype, "save");
                })

                it("returns false", function() {
                    expect(this.model.save()).toBeFalsy();
                })

                it("does not save the object", function() {
                    this.model.save();
                    expect(Backbone.Model.prototype.save).not.toHaveBeenCalled();
                })

                it("triggers validationFailed", function() {
                    this.model.save();
                    expect(this.validationFailedSpy).toHaveBeenCalled();
                })
            })

            context("passing attrs to the save method", function() {
                beforeEach(function() {
                    this.model.declareValidations = function(newAttrs) {
                        this.require('requiredAttr', newAttrs);
                    };

                    this.model.set({requiredAttr : 'foo'});
                    this.validationFailedSpy = jasmine.createSpy();
                    this.model.bind("validationFailed", this.validationFailedSpy);
                    this.validatedSpy = jasmine.createSpy();
                    this.model.bind("validated", this.validatedSpy);
                    spyOn(Backbone.Model.prototype, "save");
                });

                context("when the attrs are valid", function() {
                    beforeEach(function() {
                        this.model.save({requiredAttr : "bar"})
                    });

                    it("saves the model", function() {
                        expect(Backbone.Model.prototype.save).toHaveBeenCalled();
                    });

                    it("triggers validated", function() {
                        expect(this.validatedSpy).toHaveBeenCalled();
                    });
                });

                context("when the attrs are invalid", function() {
                    beforeEach(function() {
                        this.model.save({requiredAttr : ""})
                    });

                    it("does not save the model", function() {
                        expect(Backbone.Model.prototype.save).not.toHaveBeenCalled();
                    })

                    it("triggers validationFailed", function() {
                        expect(this.validationFailedSpy).toHaveBeenCalled();
                    })
                });
            });

            it("calls the 'beforeSave' hook", function() {
                spyOn(this.model, 'beforeSave');
                this.model.save();
                expect(this.model.beforeSave).toHaveBeenCalled();
            });
        });

        describe("#destroy", function () {
            beforeEach(function() {
                this.destroySpy = jasmine.createSpy();
                this.destroyFailedSpy = jasmine.createSpy();
                this.model.bind("destroy", this.destroySpy);
                this.model.bind("destroyFailed", this.destroyFailedSpy);
                this.model.destroy();
            });

            describe("when the request succeeds", function() {
                beforeEach(function() {
                    this.response = { status: "ok", resource : [
                        { foo : "hi" }
                    ] };

                    this.server.respondWith(
                        'DELETE',
                        '/edc/my_items/foo',
                        this.prepareResponse(this.response));

                    this.server.respond();
                });

                it("triggers a destroy event", function() {
                    expect(this.destroySpy).toHaveBeenCalled();
                })

                it("does not trigger a destroyFailed event", function() {
                    expect(this.destroyFailedSpy).not.toHaveBeenCalled();
                })
            });

            describe("when the request fails", function() {
                beforeEach(function() {
                    this.response = { status: "fail", message : [
                        { message : "hi" },
                        { message : "bye" }
                    ] };

                    this.server.respondWith(
                        'DELETE',
                        '/edc/my_items/foo',
                        this.prepareResponse(this.response));

                    this.server.respond();
                });

                it("triggers a destroyFailed event", function() {
                    expect(this.destroyFailedSpy).toHaveBeenCalled();
                })

                it("does not trigger a destroy event", function() {
                    expect(this.destroySpy).not.toHaveBeenCalled();
                })
            });
        })

        describe("before parsing", function() {
            it("is not loaded", function() {
                expect(this.model.loaded).toBeFalsy();
            });
        });

        describe("#parse", function() {
            beforeEach(function() {
                this.thing = {hi: "there"};
            })

            it("sets loaded", function() {
                this.model.parse({ foo: "bar", resource: this.thing});
                expect(this.model.loaded).toBeTruthy();
            });

            it("returns the enclosed resource", function() {
                expect(this.model.parse({ status: "ok", foo: "bar", resource: [ this.thing ]})).toBe(this.thing);
            });

            it("triggers needsLogin on chorus.session", function() {
                spyOn(chorus.session, "trigger");
                this.model.parse({status: "needlogin"});
                expect(chorus.session.trigger).toHaveBeenCalledWith("needsLogin");
            });
        })

        describe("#require", function() {
            beforeEach(function() {
                this.model.errors = {};
            })

            it("sets an error if the attribute isn't present", function() {
                this.model.require("foo");
                expect(this.model.errors.foo).toBeDefined();
            })

            it("does not clobber a previously-existing error", function() {
                this.model.errors["foo"] = "nope";
                this.model.require("foo");
                expect(this.model.errors.foo).toBe("nope");
            })

            it("sets an error if the attribute is present, is a String, and contains only whitespace", function() {
                this.model.set({ foo : "    " })
                this.model.require("foo");
                expect(this.model.errors.foo).toBeDefined();
            })

            it("does not set an error if the attribute is present", function() {
                this.model.set({ foo : "bar" });
                this.model.require("foo");
                expect(this.model.errors.foo).not.toBeDefined();
            })

            it("contains the attr name", function() {
                this.model.require("foo");
                expect(this.model.errors.foo).toContain("foo");
            });

            it("sets an error if newAttrs is invalid but the existing value is valid", function() {
                this.model.set({foo: "bar"});
                this.model.require("foo", {foo: ""});

                expect(this.model.errors.foo).toBeDefined();
            });

            it("does not set an error if the newAttrs is valid", function() {
                this.model.set({foo: "bar"});
                this.model.require("foo", {foo: "quux"});

                expect(this.model.errors.foo).not.toBeDefined();
            });

            context("model has attrToLabel set", function() {
                beforeEach(function() {
                    this.model.attrToLabel = {
                        "foo" : "users.first_name"
                    }
                });

                it("includes the translation in the error message", function() {
                    this.model.require("foo");
                    expect(this.model.errors.foo).toContain(t("users.first_name"));
                });
            });
        })

        describe("requirePattern", function() {
            beforeEach(function() {
                this.model.errors = {};
            })

            it("sets an error if the attribute isn't present", function() {
                this.model.requirePattern("foo");
                expect(this.model.errors.foo).toBeDefined();
            })

            it("does not clobber a previously-existing error", function() {
                this.model.errors["foo"] = "nope";
                this.model.requirePattern("foo");
                expect(this.model.errors.foo).toBe("nope");
            })
            it("sets an error if the attribute is present but doesn't match the pattern", function() {
                this.model.set({ foo : "bar" });
                this.model.requirePattern("foo", /baz/);
                expect(this.model.errors.foo).toBeDefined();
            })

            it("does not set an error if the attribute is present and matches the pattern", function() {
                this.model.set({ foo : "bar" }, { silent : true });
                this.model.requirePattern("foo", /bar/);
                expect(this.model.errors.foo).not.toBeDefined();
            })

            it("contains the attr name in the error", function() {
                this.model.requirePattern("foo", /hello/);
                expect(this.model.errors.foo).toContain("foo");
            });

            it("sets an error if newAttrs is invalid but the existing value is valid", function() {
                this.model.set({foo: "bar"});
                this.model.requirePattern("foo", /bar/, {foo: ""});

                expect(this.model.errors.foo).toBeDefined();
            });

            it("does not set an error if the newAttrs is valid", function() {
                this.model.set({foo: "123"});
                this.model.requirePattern("foo", /\d+/, {foo: "456"});

                expect(this.model.errors.foo).not.toBeDefined();
            });

            context("model has attrToLabel set", function() {
                beforeEach(function() {
                    this.model.attrToLabel = {
                        "foo" : "users.first_name"
                    }
                });

                it("includes the translation in the error message", function() {
                    this.model.require("foo", /hello/);
                    expect(this.model.errors.foo).toContain(t("users.first_name"));
                });
            });
        });

        describe("requireConfirmation", function() {
            beforeEach(function() {
                this.model.errors = {};
            });

            it("sets an error if the attribute isn't present", function () {
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).toBeDefined();
            });

            it("does not clobber a previously-existing error", function() {
                this.model.errors["foo"] = "nope";
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).toBe("nope");
            })

            it("sets an error if the confirmation isn't present", function () {
                this.model.set({ foo : "bar" });
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).toBeDefined();
            });

            it("sets an error if the confirmation doesn't match the attribute", function() {
                this.model.set({ foo : "bar", fooConfirmation : "baz" });
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).toBeDefined();
            });

            it("does not set an error if the confirmation matches the attribute", function() {
                this.model.set({ foo : "bar", fooConfirmation : "bar" });
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).not.toBeDefined();
            });

            it("contains the attr name in the error", function() {
                this.model.set({ foo : "bar", fooConfirmation : "baz" });
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).toContain("foo");
            });

            it("sets an error if newAttrs is invalid but the existing value is valid", function() {
                this.model.set({foo: "bar", fooConfirmation: "bar"});
                this.model.requireConfirmation("foo", {foo: "a", fooConfirmation: "b"});

                expect(this.model.errors.foo).toBeDefined();
            });

            it("does not set an error if the newAttrs is valid", function() {
                this.model.set({foo: "123", fooConfirmation: "123"});
                this.model.requireConfirmation("foo", {foo: "456", fooConfirmation: "456"});

                expect(this.model.errors.foo).not.toBeDefined();
            });

            it("throws if newAttrs supplies an original and not a confirmation", function() {
                this.model.set({foo: "123", fooConfirmation: "123"});

                try {
                    this.model.requireConfirmation("foo", {foo: "456"});
                    expect("should never get here").toBe("wtf");
                } catch (e) {
                    // test passed
                }
            });

            context("model has attrToLabel set", function() {
                beforeEach(function() {
                    this.model.attrToLabel = {
                        "foo" : "users.first_name"
                    }
                });

                it("includes the translation in the error message", function() {
                    this.model.set({ foo : "bar", fooConfirmation : "baz" });
                    this.model.requireConfirmation("foo");
                    expect(this.model.errors.foo).toContain(t("users.first_name"));
                });
            });
        });
    });

    describe("Collection", function() {
        beforeEach(function() {
            this.collection = new chorus.models.Collection([], { foo: "bar" });
            this.collection.urlTemplate = "bar/{{foo}}";
        })

        describe("#url", function() {
            context("when the collection has pagination information from the server", function() {
                beforeEach(function() {
                    this.collection.pagination = {
                        page: '4',
                        total: '5',
                        records: '250'
                    };
                });

                it("fetches the corresponding page of the collection", function() {
                    expect(this.collection.url()).toBe("/edc/bar/bar?page=1&rows=50");
                });
            });

            context("when the collection has NO pagination or page property", function() {
                it("fetches the first page of the collection", function() {
                    expect(this.collection.url()).toBe("/edc/bar/bar?page=1&rows=50");
                });
            });

            it("takes an optional page size", function() {
                expect(this.collection.url({ rows : 1000 })).toBe("/edc/bar/bar?page=1&rows=1000");
            });

            it("takes an optional page number", function() {
                expect(this.collection.url({ page : 4 })).toBe("/edc/bar/bar?page=4&rows=50");
            });

            it("mixes in sortIndex and sortOrder from the collection", function() {
                this.collection.sortAsc("foo");
                expect(this.collection.url()).toBe("/edc/bar/bar?page=1&rows=50&sidx=foo&sord=asc");
            })

            it("plays nicely with existing parameters in the url template", function() {
                this.collection.urlTemplate = "bar/{{foo}}?why=not";
                expect(this.collection.url()).toBe("/edc/bar/bar?why=not&page=1&rows=50");
            })
        });

        describe("before parsing", function() {
            it("is not loaded", function() {
                expect(this.collection.loaded).toBeFalsy();
            })
        })

        describe("#parse", function() {
            beforeEach(function() {
                this.things = [
                    {hi: "there"},
                    {go: "away"}
                ];
            })

            it("sets loaded", function() {
                this.collection.parse({ foo: "bar", resource: this.things});
                expect(this.collection.loaded).toBeTruthy();
            });

            it("returns the enclosed resource", function() {
                expect(this.collection.parse({ foo: "bar", resource: this.things})).toBe(this.things);
            })

            it("triggers needsLogin on chorus.session", function() {
                spyOn(chorus.session, "trigger");
                this.collection.parse({status: "needlogin"});
                expect(chorus.session.trigger).toHaveBeenCalledWith("needsLogin");
            })

            it("stores pagination info on the collection", function() {
                var pagination = {
                    total : "2",
                    page : "1",
                    records : "52"
                }

                this.collection.parse({ resource : this.things, pagination : pagination });
                expect(this.collection.pagination).toBe(pagination);
            })
        })

        describe("#fetch", function() {
            context("when the collection does not contain pagination information", function() {
                it("fetches the first page of items", function() {
                    this.collection.fetch();
                    expect(this.server.requests[0].url).toBe("/edc/bar/bar?page=1&rows=50")
                })
            })

            context("when the collection has pagination information", function() {
                beforeEach(function() {
                    this.collection.pagination = {
                        page : "2",
                        total : "3",
                        records : "22"
                    }
                })

                it("fetches the page specified in the pagination information", function() {
                    this.collection.fetch();
                    expect(this.server.requests[0].url).toBe("/edc/bar/bar?page=1&rows=50")
                })
            })
        });

        describe("#fetchAll", function() {
            beforeEach(function() {
                this.collection.fetchAll();
            })

            it("requests page one from the server", function() {
                expect(this.server.requests[0].url).toBe("/edc/bar/bar?page=1&rows=1000");
            })

            describe("and the server responds successfully", function() {
                beforeEach(function() {
                    this.pageOneResponse = { status: "ok", resource : [
                        { foo : "hi" },
                        { foo : "there" }
                    ],
                        "pagination": {
                            "total": "2",
                            "page": "1",
                            "records": "3"
                        }
                    };

                    this.server.respondWith(
                        'GET',
                        '/edc/bar/bar?page=1&rows=1000',
                        this.prepareResponse(this.pageOneResponse));

                    this.pageTwoResponse = { status: "ok", resource : [
                        { foo : "hi" },
                        { foo : "there" }
                    ],
                        "pagination": {
                            "total": "2",
                            "page": "2",
                            "records": "3"
                        }
                    };

                    this.server.respondWith(
                        'GET',
                        '/edc/bar/bar?page=2&rows=1000',
                        this.prepareResponse(this.pageTwoResponse));

                    var self = this;

                    this.resetListener = function(collection) {
                        self.collectionLengthOnReset = collection.length;
                    }
                    this.collection.bind("reset", this.resetListener)
                    this.server.respond();
                })

                it("requests subsequent pages", function() {
                    expect(this.server.requests[1].url).toBe("/edc/bar/bar?page=2&rows=1000");
                })

                it("triggers the reset event after all models are in the collection", function() {
                    expect(this.collectionLengthOnReset).toBe(4)
                })
            })

            describe("and the server responds with an error", function() {
                beforeEach(function() {
                    this.pageOneResponse = { status: "ok", resource : [
                        { foo : "hi" },
                        { foo : "there" }
                    ],
                        "pagination": {
                            "total": "2",
                            "page": "1",
                            "records": "3"
                        }
                    };

                    this.server.respondWith(
                        'GET',
                        '/edc/bar/bar?page=1&rows=1000',
                        this.prepareResponse(this.pageOneResponse));

                    this.pageTwoResponse = {
                        status: "fail",
                        resource: [],
                        message:[
                            {
                                "message":"Something went sideways"
                            }
                        ]
                    };

                    this.server.respondWith(
                        'GET',
                        '/edc/bar/bar?page=2&rows=1000',
                        this.prepareResponse(this.pageTwoResponse));

                    var self = this;

                    this.resetListener = function(collection) {
                        self.collectionLengthOnReset = collection.length;
                    }
                    this.collection.bind("reset", this.resetListener)
                    this.server.respond();
                })

                it("requests subsequent pages", function() {
                    expect(this.server.requests[1].url).toBe("/edc/bar/bar?page=2&rows=1000");
                })

                it("triggers the reset event when the error occurs", function() {
                    expect(this.collectionLengthOnReset).toBe(2)
                })
            })
        })

        describe("#fetchPage", function() {
            it("requests page one from the server", function() {
                this.collection.fetchPage(2);
                expect(this.server.requests[0].url).toBe("/edc/bar/bar?page=2&rows=50");
            })

            it("passes options through to fetch", function() {
                spyOn(this.collection, "fetch");
                this.collection.fetchPage(2, { foo : "bar" })
                var options = this.collection.fetch.mostRecentCall.args[0];
                expect(options.foo).toBe("bar");
            })

            it("does not affect subsequent calls to fetch", function() {
                this.collection.fetchPage(2);
                this.collection.fetch();
                expect(this.server.requests[1].url).toBe("/edc/bar/bar?page=1&rows=50");
            })

        })
    });
});

