describe("backbone base classes", function() {
    describe("chorus.models", function() {
        describe("Base", function() {
            beforeEach(function() {
                this.model = new chorus.models.Base({ bar: "foo"});
                this.model.urlTemplate = "foo/{{bar}}";
            });

            describe("#url", function() {
                it("compiles the urlTemplate and renders it with model attributes", function() {
                    expect(this.model.url()).toBe("/edc/foo/foo");
                }); 
            });

            describe("#save", function() {
                beforeEach(function() {
                    this.model.save();
                    this.savedSpy = jasmine.createSpy();
                    this.model.bind("saved", this.savedSpy);
                });

                describe("when the request succeeds", function() {
                    beforeEach(function() {
                        this.response = { status: "ok", resource : [
                            { foo : "hi" }
                        ] };

                        this.server.respondWith(
                            'POST',
                            '/edc/foo/foo',
                            this.prepareResponse(this.response));

                        this.server.respond();
                    });

                    it("triggers a saved event", function() {
                        expect(this.savedSpy).toHaveBeenCalled();
                    })
                })

                describe("when the request fails", function() {
                    beforeEach(function() {

                        this.response = { status: "fail", message : [
                            { message : "hi" },
                            { message : "bye" }
                        ] };
                        this.server.respondWith(
                            'POST',
                            '/edc/foo/foo',
                            this.prepareResponse(this.response));
                        this.server.respond();

                    });

                    it("returns the error information", function() {
                        expect(this.model.get('errors')).toEqual(this.response.message);
                    })

                    describe("and then another request succeeds", function() {
                        beforeEach(function() {
                            this.response = { status: "ok", resource : [
                                { foo : "hi" }
                            ] };

                            this.server = sinon.fakeServer.create();
                            this.server.respondWith(
                                'POST',
                                '/edc/foo/foo',
                                this.prepareResponse(this.response));

                            this.model.save();
                            this.server.respond();
                        });
                        it("should trigger the saved event", function() {
                            expect(this.savedSpy).toHaveBeenCalled();
                        });

                        it("clears the error information", function() {
                            expect(this.model.get('errors')).toBeUndefined();
                        })
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
                })
            })
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
                    this.things = [{hi: "there"}, {go: "away"}];
                })

                it("sets loaded", function() {
                    this.collection.parse({ foo: "bar", resource: this.things});
                    expect(this.collection.loaded).toBeTruthy();
                });

                it("returns the enclosed resource", function() {
                    expect(this.collection.parse({ foo: "bar", resource: this.things})).toBe(this.things);
                })
            })
        });
    });
});
