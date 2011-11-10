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
                });

                it("triggers needsLogin on chorus.session", function() {
                    spyOn(chorus.session, "trigger");
                    this.model.parse({status: "needlogin"});
                    expect(chorus.session.trigger).toHaveBeenCalledWith("needsLogin");
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
    describe("chorus.views", function() {
        describe("#context", function() {
            describe("for a view with a model", function() {
                beforeEach(function() {
                    this.model = new chorus.models.Base({ bar: "foo"});
                    this.view = new chorus.views.Base({ model : this.model });
                });

                it("serializes the attributes of the model", function() {
                    expect(this.view.context()).toEqual({ bar: "foo" });
                })

                describe("loaded:true", function() {
                    beforeEach(function() {
                        this.model.loaded = true;
                    });

                    it("returns loaded:true", function() {
                        expect(this.view.context().loaded).toBeTruthy();
                    });
                });

                describe("loaded:false", function() {
                    beforeEach(function() {
                        this.model.loaded = false;
                    });

                    it("returns loaded:false", function() {
                        expect(this.view.context().loaded).toBeFalsy();
                    });
                });
            })

            describe("for a view with a collection", function () {
                beforeEach(function() {
                    this.collection = new chorus.models.Collection([
                        new chorus.models.Base({ bar: "foo"}),
                        new chorus.models.Base({ bro: "baz"})
                    ], { custom: "stuff" });
                    this.view = new chorus.views.Base({ collection: this.collection });
                });

                it("serializes the attributes of the collection", function() {
                    expect(this.view.context().custom).toBe("stuff");
                })

                it("serializes the attributes of the collection objects into the 'models' key", function() {
                    var modelContext = this.view.context().models;
                    expect(modelContext).not.toBeUndefined();
                    expect(modelContext.length).toBe(2);
                    expect(modelContext[0]).toEqual({ bar: "foo" });
                    expect(modelContext[1]).toEqual({ bro: "baz" });
                })

                describe("loaded:true", function() {
                    beforeEach(function() {
                        this.collection.loaded = true;
                    });

                    it("returns loaded:true", function() {
                        expect(this.view.context().loaded).toBeTruthy();
                    });
                });

                describe("loaded:false", function() {
                    beforeEach(function() {
                        this.collection.loaded = false;
                    });

                    it("returns loaded:false", function() {
                        expect(this.view.context().loaded).toBeFalsy();
                    });
                });
            })
        })
    })

    describe("chorus.views.MainContentView", function(){
        beforeEach(function(){
            this.loadTemplate("main_content");
        });
        
        describe("#render", function(){
            beforeEach(function(){
                this.view = new chorus.views.MainContentView();

                this.view.contentHeader = stubView("header text");
                this.view.content = stubView("content text");

                this.view.render();
            });

            context("with a supplied contentHeader", function(){
                it("should render the header", function(){
                    expect(this.view.$("#content_header").text()).toBe("header text");
                });
            });

            context("with a supplied content", function(){
                it("should render the content", function(){
                    expect(this.view.$("#content").text()).toBe("content text");
                });
            });

            context("without a supplied contentDetails", function(){
                it("should have the hidden class on the content_details div", function(){
                    expect((this.view.$("#content_details"))).toHaveClass("hidden");
                });
            });

            context("with a supplied contentDetails", function(){
                beforeEach(function(){
                    this.view.contentDetails = stubView("content details text");
                    this.view.render();
                });
                
                it("should render the contentDetails", function(){
                    expect((this.view.$("#content_details").text())).toBe("content details text");
                });
            });
        });
    });
});
