describe("chorus.views", function() {
    describe("event bindings", function() {
        beforeEach(function() {
            this.model = new chorus.models.Base();
        });

        describe("with persistent falsy", function() {
            beforeEach(function() {
                this.view = new chorus.views.Base({model : this.model});
                spyOn(this.view, 'template').andReturn("");
                // render is bound on the view object before we can spy on it.
                spyOn(this.view, "preRender");
            })

            _.each(["reset", "add", "remove", "change"], function(evt) {
                it("re-renders on the " + evt + " event", function() {
                    this.view.resource.trigger(evt);
                    expect(this.view.preRender).toHaveBeenCalled();
                });
            });
        })

        describe("with persistent:true", function() {
            beforeEach(function() {
                chorus.views.Base.prototype.persistent = true
                this.view = new chorus.views.Base({model : this.model});
                spyOn(this.view, 'template').andReturn("");
                // render is bound on the view object before we can spy on it.
                spyOn(this.view, "preRender");
            });
            afterEach(function() {
                delete chorus.views.Base.prototype.persistent;
            });

            _.each(["reset", "add", "remove", "change"], function(evt) {
                it("re-renders on the " + evt + " event", function() {
                    this.view.resource.trigger(evt);
                    expect(this.view.preRender).not.toHaveBeenCalled();
                });
            });
        });
    });

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

            describe("when an additionalContext is defined", function() {
                beforeEach(function() {
                    this.view.additionalContext = function() {
                        return {one: 1};
                    };
                });

                it("still contains the attributes of the model", function() {
                    expect(this.view.context().bar).toBe("foo");
                });

                it("includes the additionalContext in the context", function() {
                    expect(this.view.context().one).toBe(1);
                });
            });

            describe("#preRender", function() {
                beforeEach(function() {
                    var self = this;
                    this.postRenderCallCountWhenPreRenderCalled = 0;
                    this.view.template = function() {
                        return "<form><input name='foo'/><input name='bar'/><input name='whiz'/></form>";
                    };

                    spyOn(this.view, "postRender").andCallThrough();
                    spyOn(this.view, "preRender").andCallFake(function() {
                        self.postRenderCallCountWhenPreRenderCalled = self.view.postRender.callCount;
                    })

                    this.view.render();
                });

                it("is called before postRender", function() {
                    expect(this.postRenderCallCountWhenPreRenderCalled).toBe(0);
                    expect(this.view.postRender.callCount).toBe(1);
                })
            })

            describe("#render", function() {
                beforeEach(function() {
                    this.view.className = "plain_text"
                    spyOnEvent(this.view, "rendered");
                    this.view.render();
                })

                it("triggers a 'rendered' event on itself", function() {
                    expect("rendered").toHaveBeenTriggeredOn(this.view);
                })
            })

        });

        describe("when an additionalContext is defined", function() {
            beforeEach(function() {
                this.view = new chorus.views.Base();
                spyOn(this.view, "additionalContext").andCallFake(function() {
                    return {one: 1};
                });
            });

            it("includes the additionalContext in the context", function() {
                expect(this.view.context().one).toBe(1);
            });
        });

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

            context("when a collectionModelContext is defined", function() {
                beforeEach(function() {
                    this.view.collectionModelContext = function(model) {
                        return {my_cid: model.cid}
                    };
                });

                it("includes the collectionModelContext in the context for each model", function() {
                    var context = this.view.context();
                    expect(context.models[0].my_cid).toBe(this.collection.models[0].cid);
                    expect(context.models[1].my_cid).toBe(this.collection.models[1].cid);
                });
            });

            describe("when an additionalContext is defined", function() {
                beforeEach(function() {
                    spyOn(this.view, "additionalContext").andCallFake(function() {
                        return {one: 1};
                    });
                });

                it("includes the additionalContext in the context", function() {
                    expect(this.view.context().one).toBe(1);
                });
            });

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
        });

    });

    describe("validation", function() {
        beforeEach(function() {
            this.model = new chorus.models.Base();
            this.view = new chorus.views.Base({ model : this.model });
            this.view.template = function() {
                return "<form><input name='foo'/><input name='bar'/><input name='whiz'/></form>";
            };

            spyOn(Backbone.Model.prototype, "save");
            spyOn(this.view, "render").andCallThrough();
            this.view.render();
        });


        describe("failure", function() {
            beforeEach(function() {
                this.model.performValidation = function() {
                    this.errors = {};
                    this.require("foo");
                };
                this.model.save();
            });

            it("sets the has_error class on fields with errors", function() {
                expect(this.view.$("input[name=foo]")).toHaveClass("has_error");
                expect(this.view.$("input[name=foo]").hasQtip()).toBeTruthy();
            });

            it("clears the has_error class on all fields without errors", function() {
                expect(this.view.$("input[name=bar]")).not.toHaveClass("has_error");
                expect(this.view.$("input[name=whiz]")).not.toHaveClass("has_error");
                expect(this.view.$("input[name=bar]").hasQtip()).toBeFalsy();
                expect(this.view.$("input[name=whiz]").hasQtip()).toBeFalsy();
            });

            it("does not re-render", function() {
                expect(this.view.render.callCount).toBe(1);
            });

            it("adds tooltips to the has_error fields", function() {
                expect(this.view.$(".has_error").hasQtip()).toBeTruthy();
            });

            it("does not add tooltips to the other input fields", function() {
                expect(this.view.$("input[name=bar]").hasQtip()).toBeFalsy();
            });

            it("clears error html that is not applicable", function() {
                this.model.set({"foo": "bar"}, {silent: true});
                this.model.save();
                expect(this.view.$("input[id=foo]").hasQtip()).toBeFalsy();
                expect($(".qtip").length).toBe(0);
            });

            describe("success after failure", function() {
                beforeEach(function() {
                    this.model.trigger("validated");
                })

                it("clears client-side errors", function() {
                    expect(this.view.$(".has_error").length).toBe(0);
                    expect(this.view.$("input[name=bar]").hasQtip()).toBeFalsy();
                    expect(this.view.$("input[name=foo]").hasQtip()).toBeFalsy();
                    expect(this.view.$("input[name=whiz]").hasQtip()).toBeFalsy();
                })
            })
        })
    })

    describe("MainContentView", function() {
        describe("#render", function() {
            beforeEach(function() {
                this.view = new chorus.views.MainContentView();

                this.view.contentHeader = stubView("header text");
                this.view.content = stubView("content text");

                this.view.render();
            });

            context("with a supplied contentHeader", function() {
                it("should render the header", function() {
                    expect(this.view.$(".content_header").text()).toBe("header text");
                });
            });

            context("with a supplied content", function() {
                it("should render the content", function() {
                    expect(this.view.$(".content").text()).toBe("content text");
                });
            });

            context("without a supplied content", function() {
                beforeEach(function() {
                    this.view.content = undefined;
                    this.view.render();
                });

                it("should have the hidden class on the content div", function() {
                    expect((this.view.$(".content"))).toHaveClass("hidden");
                });
            })

            context("without a supplied contentDetails", function() {
                it("should have the hidden class on the content_details div", function() {
                    expect((this.view.$(".content_details"))).toHaveClass("hidden");
                });
            });

            context("with a supplied contentDetails", function() {
                beforeEach(function() {
                    this.view.contentDetails = stubView("content details text");
                    this.view.render();
                });

                it("should render the contentDetails", function() {
                    expect((this.view.$(".content_details").text())).toBe("content details text");
                });
            });

            context("without a supplied contentFooter", function() {
                it("should have the hidden class on the content_footer div", function() {
                    expect((this.view.$(".content_footer"))).toHaveClass("hidden");
                });
            });

            context("with a supplied contentFooter", function() {
                beforeEach(function() {
                    this.view.contentFooter = stubView("content footer text");
                    this.view.render();
                });

                it("should render the contentFooter", function() {
                    expect((this.view.$(".content_footer").text())).toBe("content footer text");
                });
            });
        });
    });

    describe("ListHeaderView", function() {
        beforeEach(function() {
            this.view = new chorus.views.ListHeaderView({
                title : "Hi there",
                linkMenus : {
                    type : {
                        title : "Title",
                        options : [
                            {data : "", text : "All"},
                            {data : "sql", text : "SQL"}
                        ],
                        event : "filter"
                    }
                }
            });
        });

        describe("#render", function() {
            beforeEach(function() {
                this.view.render();
            })

            it("renders link menus", function() {
                expect(this.view.$(".menus ul[data-event=filter]")).toExist();
            })

            it("renders the header title", function() {
                expect(this.view.$("h1").text().trim()).toBe("Hi there")
            })
        })

        describe("event propagation", function() {
            beforeEach(function() {
                this.view.render();
            })

            it("propagates choice events as choice: events", function() {
                this.choiceSpy = jasmine.createSpy("choice:filter")
                this.view.bind("choice:filter", this.choiceSpy);
                this.view.$("li[data-type=sql] a").click();
                expect(this.choiceSpy).toHaveBeenCalledWith("sql");
            })

        })

    });

    describe("loading section", function() {
        beforeEach(function() {
            this.view = new chorus.views.Bare();
            this.view.className = "plain_text";
            this.view.context = function() {
                return { text : "Foo" };
            }
        });

        describe("rendering the loading section", function() {
            context("when displayLoadingSection returns true", function() {
                beforeEach(function() {
                    this.view.displayLoadingSection = function() {
                        return true;
                    }
                });

                it("renders the loading template", function() {
                    this.view.render();
                    expect(this.view.$('.loading_section').length).toBe(1)
                    expect(this.view.$('.loading_section').text()).toMatchTranslation('loading');
                });

                context("when makeLoadingSectionView is overridden", function() {
                    beforeEach(function() {
                        var otherView = this.otherView = new chorus.views.Base();
                        spyOn(this.otherView, 'render').andReturn({el: $("<div/>")});

                        this.view.makeLoadingSectionView = function() {
                            return otherView;
                        }
                    });

                    it("renders what is returned by makeLoadingSectionView", function() {
                        this.view.render();
                        expect(this.otherView.render).toHaveBeenCalled();
                    });
                });

                context("when loadingSectionOptions is overridden", function() {
                    beforeEach(function() {
                        this.view.loadingSectionOptions = function() {
                            return {delay: 9000};
                        }

                        var origSection = chorus.views.LoadingSection;
                        spyOn(chorus.views, "LoadingSection").andReturn(new origSection());
                    });

                    it("passes those options to the LoadingSection constructor", function() {
                        this.view.render();
                        expect(chorus.views.LoadingSection).toHaveBeenCalledWith({delay: 9000});
                    });
                });
            });

            context("when displayLoadingSection returns false", function() {
                beforeEach(function() {
                    this.view.displayLoadingSection = function() {
                        return false;
                    }
                    this.view.render();
                });

                it("renders the 'normal' template", function() {
                    expect($(this.view.el).text()).toBe("Foo");
                    expect(this.view.$('.loading_section').length).toBe(0)
                });
            });
        });
    });

    describe("chorus.views.Base", function() {
        describe("displayLoadingSection", function() {
            beforeEach(function() {
                this.model = new chorus.models.Base();
                this.view = new chorus.views.Base({model: this.model});
            });

            it("returns false by default", function() {
                expect(this.view.displayLoadingSection()).toBeFalsy();
            });

            context("when the view has useLoadingSection set to true", function() {
                beforeEach(function() {
                    this.view.useLoadingSection = true;
                });

                it("returns the opposite of view.resource.loaded", function() {
                    this.model.loaded = false;
                    expect(this.view.displayLoadingSection()).toBeTruthy();

                    this.model.loaded = true;
                    expect(this.view.displayLoadingSection()).toBeFalsy();
                });

                it("returns false when the view does not have a resource", function() {
                    delete this.view.resource;
                    expect(this.view.displayLoadingSection()).toBeFalsy();
                });
            });
        });
    });
})
