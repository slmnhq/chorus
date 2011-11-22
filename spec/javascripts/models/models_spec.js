describe("chorus.models", function() {
    describe("Base", function() {
        beforeEach(function() {
            this.model = new chorus.models.Base({ bar: "foo"});
            this.model.urlTemplate = "my_items/{{bar}}";
        });

        describe("#url", function() {
            it("compiles the urlTemplate and renders it with model attributes", function() {
                expect(this.model.url()).toBe("/edc/my_items/foo");
            });
        });

        describe("#showUrl", function() {
            it("returns #/{{showUrlTemplate}}", function() {
                this.model.showUrlTemplate = "my_items/show/{{bar}}";
                expect(this.model.showUrl()).toBe("#/my_items/show/foo")
            });

            it("throws when showUrlTemplate is not set", function(){
                expect(this.model.showUrl).toThrow("No showUrlTemplate defined");
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
                            'POST',
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
                            'POST',
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
                            'POST',
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
                            'POST',
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
                                'POST',
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

                it("does not trigger saved", function() {
                    this.model.save();
                    expect(this.savedSpy).not.toHaveBeenCalled();
                })

                it("triggers validationFailed", function() {
                    this.model.save();
                    expect(this.validationFailedSpy).toHaveBeenCalled();
                })
            })
        });

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

            it("does not set an error if the attribute is present", function() {
                this.model.set({ foo : "bar" });
                this.model.require("foo");
                expect(this.model.errors.foo).not.toBeDefined();
            })
        })

        describe("requirePattern", function() {
            beforeEach(function() {
                this.model.errors = {};
            })

            it("sets an error if the attribute isn't present", function() {
                this.model.requirePattern("foo");
                expect(this.model.errors.foo).toBeDefined();
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
        });

        describe("requireConfirmation", function() {
            beforeEach(function() {
                this.model.errors = {};
            });

            it("sets an error if the attribute isn't present", function () {
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).toBeDefined();
            });

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
        });
    });

    describe("Collection", function() {
        beforeEach(function() {
            this.collection = new chorus.models.Collection([], { foo: "bar" });
            this.collection.urlTemplate = "bar/{{foo}}";
        })

        describe("#url", function() {
            it("compiles the urlTemplate and renders it with model attributes", function() {
                expect(this.collection.url()).toBe("/edc/bar/bar");
            });
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
        })
    });
});

