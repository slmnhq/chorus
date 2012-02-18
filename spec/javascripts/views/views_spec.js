describe("chorus.views.Base", function () {
    describe("initialize", function () {
        describe("resourcesLoaded", function () {
            beforeEach(function () {
                this.model1 = new chorus.models.Base();
                this.model2 = new chorus.models.Base();
                spyOn(this.model1, 'url').andReturn('/foo/bar');
                spyOn(this.model2, 'url').andReturn('/foo/quux');
                spyOn(chorus.views.Base.prototype, 'resourcesLoaded');
                spyOn(chorus.views.Base.prototype, 'render');
            });

            context("when the resources are already loaded", function () {
                beforeEach(function () {
                    this.model1.loaded = true;
                    this.model2.loaded = true;
                    this.view = new chorus.views.Base({requiredResources:[this.model1, this.model2]});
                });

                it("calls resourcesLoaded during initialization", function () {
                    expect(this.view.resourcesLoaded).toHaveBeenCalled();
                });
            });

            context("when the resources are not loaded", function () {
                beforeEach(function () {
                    this.model1.loaded = false;
                    this.model2.loaded = false;
                    this.model1.fetch();
                    this.model2.fetch();
                    this.view = new chorus.views.Base({requiredResources:[this.model1, this.model2]});
                });

                it("does not call resourcesLoaded during initialization", function () {
                    expect(this.view.resourcesLoaded).not.toHaveBeenCalled();
                });

                describe("once it has been loaded", function () {
                    beforeEach(function () {
                        this.server.completeFetchFor(this.model1);
                        this.server.completeFetchFor(this.model2);
                    });

                    it("calls resourcesLoaded after model has been loaded", function () {
                        expect(this.view.resourcesLoaded).toHaveBeenCalled();
                    });

                    it("calls render", function () {
                        expect(this.view.render).toHaveBeenCalled();
                    });
                });

            });
        });
    });

    describe("event bindings", function () {
        beforeEach(function () {
            this.model = new chorus.models.Base();
        });

        describe("with persistent falsy", function () {
            beforeEach(function () {
                this.view = new chorus.views.Base({model:this.model});
                spyOn(this.view, 'template').andReturn("");
                // render is bound on the view object before we can spy on it.
                spyOn(this.view, "preRender");
            })

            _.each(["reset", "add", "remove", "change"], function (evt) {
                it("re-renders on the " + evt + " event", function () {
                    this.view.resource.trigger(evt);
                    expect(this.view.preRender).toHaveBeenCalled();
                });
            });
        })

        describe("with persistent:true", function () {
            beforeEach(function () {
                chorus.views.Base.prototype.persistent = true
                this.view = new chorus.views.Base({model:this.model});
                spyOn(this.view, 'template').andReturn("");
                // render is bound on the view object before we can spy on it.
                spyOn(this.view, "preRender");
            });
            afterEach(function () {
                delete chorus.views.Base.prototype.persistent;
            });

            _.each(["reset", "add", "remove", "change"], function (evt) {
                it("re-renders on the " + evt + " event", function () {
                    this.view.resource.trigger(evt);
                    expect(this.view.preRender).not.toHaveBeenCalled();
                });
            });
        });
    });

    describe("hotkey bindings", function () {
        beforeEach(function () {
            unstubHotkeys();
            this.oldHotKeyMeta = chorus.hotKeyMeta;
            chorus.hotKeyMeta = 'ctrl';

            chorus.views.HotKeyTest = chorus.views.Base.extend({
                hotkeys:{
                    'r':'my:event'
                }
            })

            spyOn($.fn, "bind").andCallThrough();
            this.view = new chorus.views.HotKeyTest();
        })

        afterEach(function () {
            chorus.hotKeyMeta = this.oldHotKeyMeta;
        })

        it("binds hotkeys", function () {
            expect($.fn.bind).toHaveBeenCalledWith("keydown", "ctrl+r", jasmine.any(Function));
        })

        it("triggers events on hotkeys", function () {
            spyOnEvent(this.view, "my:event");
            var ev = $.Event("keydown", { which:82, ctrlKey:true })
            $(document).trigger(ev);
            expect("my:event").toHaveBeenTriggeredOn(this.view);
        })
    })
    describe("#context", function () {

        describe("for a view with a model", function () {
            beforeEach(function () {
                this.model = new chorus.models.Base({ bar:"foo"});
                this.view = new chorus.views.Base({ model:this.model });
            });

            it("serializes the attributes of the model", function () {
                expect(this.view.context()).toEqual({ bar:"foo", resource: this.model });
            })

            describe("loaded:true", function () {
                beforeEach(function () {
                    this.model.loaded = true;
                });

                it("returns loaded:true", function () {
                    expect(this.view.context().loaded).toBeTruthy();
                });
            });

            describe("loaded:false", function () {
                beforeEach(function () {
                    this.model.loaded = false;
                });

                it("returns loaded:false", function () {
                    expect(this.view.context().loaded).toBeFalsy();
                });
            });

            describe("when an additionalContext is defined", function () {
                beforeEach(function () {
                    this.view.additionalContext = function () {
                        return {one:1};
                    };
                    spyOn(this.view, 'additionalContext').andCallThrough();
                });

                it("still contains the attributes of the model", function () {
                    expect(this.view.context().bar).toBe("foo");
                });

                it("includes the additionalContext in the context", function () {
                    expect(this.view.context().one).toBe(1);
                });

                it("calls #additionalContext, passing the default context (including the server errors)", function () {
                    this.model.serverErrors = [
                        { message:"wrong" }
                    ];
                    this.view.context();
                    var contextPassed = this.view.additionalContext.mostRecentCall.args[0];
                    expect(contextPassed.serverErrors).toBe(this.model.serverErrors);
                });
            });

            describe("#preRender", function () {
                beforeEach(function () {
                    var self = this;
                    this.postRenderCallCountWhenPreRenderCalled = 0;
                    this.view.template = function () {
                        return "<form><input name='foo'/><input name='bar'/><input name='whiz'/></form>";
                    };

                    spyOn(this.view, "postRender").andCallThrough();
                    spyOn(this.view, "preRender").andCallFake(function () {
                        self.postRenderCallCountWhenPreRenderCalled = self.view.postRender.callCount;
                    })

                    this.view.render();
                });

                it("is called before postRender", function () {
                    expect(this.postRenderCallCountWhenPreRenderCalled).toBe(0);
                    expect(this.view.postRender.callCount).toBe(1);
                })
            })

            describe("#render", function () {
                beforeEach(function () {
                    this.view.className = "plain_text"
                    spyOnEvent(this.view, "rendered");
                    this.view.render();
                })

                it("triggers a 'rendered' event on itself", function () {
                    expect("rendered").toHaveBeenTriggeredOn(this.view);
                })

                it("adds the className as a class name", function() {
                    expect($(this.view.el)).toHaveClass("plain_text")
                })

                it("adds the className as a data-template", function() {
                    expect($(this.view.el)).toHaveAttr("data-template", "plain_text")
                })

                describe("with subviews", function () {
                    beforeEach(function () {
                        this.view.template = function () {
                            return "<div class='foo'/>";
                        };

                        this.subview = new chorus.views.Base();
                        this.subview.className = "plain_text";
                        this.view.foo = this.subview;

                        this.view.subviews = {".foo":"foo"};
                        spyOn(this.subview, "render");
                    })

                    context("when the subview does not have required resources", function () {
                        beforeEach(function () {
                            this.view.render();
                        })

                        it("renders the subview", function () {
                            expect(this.subview.render).toHaveBeenCalled();
                        })
                    })

                    context("when the subview has required resources", function () {
                        beforeEach(function () {
                            this.subviewModel = fixtures.user();
                            this.subview.requiredResources.add(this.subviewModel);
                        })

                        context("and the required resources are not loaded", function () {
                            beforeEach(function () {
                                this.view.render();
                            })

                            it("does not render the subview", function () {
                                expect(this.subview.render).not.toHaveBeenCalled();
                            })
                        })

                        context("and the required resources are loaded", function () {
                            beforeEach(function () {
                                this.subviewModel.loaded = true;
                                this.view.render();
                            })

                            it("renders the subview", function () {
                                expect(this.subview.render).toHaveBeenCalled();
                            })
                        })
                    })

                    describe("renderSubview", function () {
                        beforeEach(function () {
                            this.view.render();
                            this.subview.render.reset();
                        });

                        it("renders when given both object name and selector", function () {
                            this.view.renderSubview('foo', '.foo');
                            expect(this.subview.render).toHaveBeenCalled();
                        });

                        it("renders when given just the object name", function () {
                            this.view.renderSubview('foo');
                            expect(this.subview.render).toHaveBeenCalled();
                        });
                    });
                })
            })

        });

        describe("when an additionalContext is defined", function () {
            beforeEach(function () {
                this.view = new chorus.views.Base();
                spyOn(this.view, "additionalContext").andCallFake(function () {
                    return {one:1};
                });
            });

            it("includes the additionalContext in the context", function () {
                expect(this.view.context().one).toBe(1);
            });
        });

        describe("for a view with a collection", function () {
            beforeEach(function () {
                this.collection = new chorus.collections.Base([
                    new chorus.models.Base({ bar:"foo"}),
                    new chorus.models.Base({ bro:"baz"})
                ], { custom:"stuff" });
                this.view = new chorus.views.Base({ collection:this.collection });
            });

            it("serializes the attributes of the collection", function () {
                expect(this.view.context().custom).toBe("stuff");
            })

            it("serializes the attributes of the collection objects into the 'models' key", function () {
                var modelContext = this.view.context().models;
                expect(modelContext).not.toBeUndefined();
                expect(modelContext.length).toBe(2);
                expect(modelContext[0]).toEqual({ bar:"foo", model: this.collection.models[0] });
                expect(modelContext[1]).toEqual({ bro:"baz", model: this.collection.models[1] });
            })

            context("when a collectionModelContext is defined", function () {
                beforeEach(function () {
                    this.view.collectionModelContext = function (model) {
                        return {my_cid:model.cid}
                    };
                });

                it("includes the collectionModelContext in the context for each model", function () {
                    var context = this.view.context();
                    expect(context.models[0].my_cid).toBe(this.collection.models[0].cid);
                    expect(context.models[1].my_cid).toBe(this.collection.models[1].cid);
                });
            });

            describe("when an additionalContext is defined", function () {
                beforeEach(function () {
                    spyOn(this.view, "additionalContext").andCallFake(function () {
                        return {one:1};
                    });
                });

                it("includes the additionalContext in the context", function () {
                    expect(this.view.context().one).toBe(1);
                });
            });

            describe("loaded:true", function () {
                beforeEach(function () {
                    this.collection.loaded = true;
                });

                it("returns loaded:true", function () {
                    expect(this.view.context().loaded).toBeTruthy();
                });
            });

            describe("loaded:false", function () {
                beforeEach(function () {
                    this.collection.loaded = false;
                });

                it("returns loaded:false", function () {
                    expect(this.view.context().loaded).toBeFalsy();
                });
            });
        });

    });

    describe("validation", function () {
        beforeEach(function () {
            this.model = new chorus.models.Base();
            spyOn(chorus.views.Base.prototype, 'showErrors').andCallThrough();
            spyOn(chorus.views.Base.prototype, 'clearErrors').andCallThrough();
            this.view = new chorus.views.Base({ model:this.model });
            this.view.template = function () {
                return "<form><input name='foo'/><input name='bar'/><input name='whiz'/></form>";
            };
            this.model.performValidation = function () {
                this.errors = {};
                this.require("foo");
            };
        });

        it("calls #showErrors when validation fails on the model", function () {
            this.model.trigger("validationFailed");
            expect(this.view.showErrors).toHaveBeenCalled();
        });

        it("calls #clearErrors when validation succeeds on the model", function () {
            this.model.trigger("validated");
            expect(this.view.clearErrors).toHaveBeenCalled();
        });
    });

    describe("before navigating away", function () {
        beforeEach(function () {
            var navSpy = jasmine.createSpy("beforeNavigateAway")
            var klass = chorus.views.Base.extend({
                beforeNavigateAway:navSpy
            });
            this.view = new klass();
            chorus.router.trigger("leaving");
        });

        it("calls the 'beforeNavigateAway' hook", function () {
            expect(this.view.beforeNavigateAway).toHaveBeenCalled();
        });

        describe("when another navigation occurs (after this view is long gone)", function () {
            beforeEach(function () {
                chorus.router.trigger("leaving");
            });

            it("does not call the hook again", function () {
                expect(this.view.beforeNavigateAway.callCount).toBe(1);
            });
        });
    });

    describe("#showErrors", function () {
        beforeEach(function () {
            this.view = new chorus.views.Base({ model:this.model });
            this.view.template = function () {
                return "<form><input name='foo'/><input name='bar'/><input name='whiz'/></form>";
            };
            this.view.model = new chorus.models.Base();
            this.view.model.errors = { foo:"you need a foo" };
            this.view.resource = this.view.model;

            spyOn(this.view, "render").andCallThrough();
            this.view.render();
        });

        context("with no parameters", function () {
            beforeEach(function () {
                this.view.showErrors();
            });

            it("sets the has_error class on fields with errors", function () {
                expect(this.view.$("input[name=foo]")).toHaveClass("has_error");
                expect(this.view.$("input[name=foo]").hasQtip()).toBeTruthy();
            });

            it("clears the has_error class on all fields without errors", function () {
                expect(this.view.$("input[name=bar]")).not.toHaveClass("has_error");
                expect(this.view.$("input[name=whiz]")).not.toHaveClass("has_error");
                expect(this.view.$("input[name=bar]").hasQtip()).toBeFalsy();
                expect(this.view.$("input[name=whiz]").hasQtip()).toBeFalsy();
            });

            it("does not re-render", function () {
                expect(this.view.render.callCount).toBe(1);
            });

            it("adds tooltips to the has_error fields", function () {
                expect(this.view.$(".has_error").hasQtip()).toBeTruthy();
            });

            it("does not add tooltips to the other input fields", function () {
                expect(this.view.$("input[name=bar]").hasQtip()).toBeFalsy();
            });

            it("clears error html that is not applicable", function () {
                this.view.model.errors = {};
                this.view.showErrors();
                expect(this.view.$("input[id=foo]").hasQtip()).toBeFalsy();
                expect($(".qtip").length).toBe(0);
            });
        });

        context("given a different model as a parameter", function () {
            beforeEach(function () {
                this.otherModel = new chorus.models.Base();
                this.otherModel.errors = { 'bar':"you need a bar" };
                this.view.showErrors(this.otherModel);
            });

            it("uses the other model's errors, instead of the view's own model", function () {
                expect(this.view.$("input[name=foo]")).not.toHaveClass("has_error");
                expect(this.view.$("input[name=foo]").hasQtip()).toBeFalsy();
                expect(this.view.$("input[name=bar]")).toHaveClass("has_error");
                expect(this.view.$("input[name=bar]").hasQtip()).toBeTruthy();
            });
        });

        describe("calling #clearErrors afterwards", function () {
            beforeEach(function () {
                this.view.clearErrors();
            });

            it("clears client-side errors", function () {
                expect(this.view.$(".has_error").length).toBe(0);
                expect(this.view.$("input[name=bar]").hasQtip()).toBeFalsy();
                expect(this.view.$("input[name=foo]").hasQtip()).toBeFalsy();
                expect(this.view.$("input[name=whiz]").hasQtip()).toBeFalsy();
            });
        });
    });

    describe("MainContentView", function () {
        describe("#render", function () {
            beforeEach(function () {
                this.view = new chorus.views.MainContentView();

                this.view.contentHeader = stubView("header text");
                this.view.content = stubView("content text");

                this.view.render();
            });

            context("with a supplied contentHeader", function () {
                it("should render the header", function () {
                    expect(this.view.$(".content_header").text()).toBe("header text");
                });
            });

            context("with a supplied content", function () {
                it("should render the content", function () {
                    expect(this.view.$(".content").text()).toBe("content text");
                });
            });

            context("without a supplied content", function () {
                beforeEach(function () {
                    this.view.content = undefined;
                    this.view.render();
                });

                it("should have the hidden class on the content div", function () {
                    expect((this.view.$(".content"))).toHaveClass("hidden");
                });
            })

            context("without a supplied contentDetails", function () {
                it("should have the hidden class on the content_details div", function () {
                    expect((this.view.$(".content_details"))).toHaveClass("hidden");
                });
            });

            context("with a supplied contentDetails", function () {
                beforeEach(function () {
                    this.view.contentDetails = stubView("content details text");
                    this.view.render();
                });

                it("should render the contentDetails", function () {
                    expect((this.view.$(".content_details").text())).toBe("content details text");
                });
            });

            context("without a supplied contentFooter", function () {
                it("should have the hidden class on the content_footer div", function () {
                    expect((this.view.$(".content_footer"))).toHaveClass("hidden");
                });
            });

            context("with a supplied contentFooter", function () {
                beforeEach(function () {
                    this.view.contentFooter = stubView("content footer text");
                    this.view.render();
                });

                it("should render the contentFooter", function () {
                    expect((this.view.$(".content_footer").text())).toBe("content footer text");
                });
            });
        });
    });

    describe("MainContentList", function () {
        beforeEach(function () {
            this.collection = fixtures.workfileSet();
        })

        describe("#setup", function () {
            context("when no title override is provided", function () {
                beforeEach(function () {
                    this.view = new chorus.views.MainContentList({ collection:this.collection, modelClass:"Workfile" });
                })

                it("sets the title of the content header to the plural of the model class", function () {
                    expect(this.view.contentHeader.options.title).toBe("Workfiles")
                })
            })

            context("when a title override is provided", function () {
                beforeEach(function () {
                    this.view = new chorus.views.MainContentList({ collection:this.collection, modelClass:"Workfile", title:"YES!" });
                })

                it("sets the title of the content header to the override", function () {
                    expect(this.view.contentHeader.options.title).toBe("YES!")
                })
            })

            context("when a contentOptions hash is provided", function() {
                beforeEach(function () {
                    this.view = new chorus.views.MainContentList({ collection:this.collection, modelClass:"Workfile", contentOptions : {foo: "bar"} });
                })

                it("gets mixed in to the content's options", function () {
                    expect(this.view.content.options).toEqual({foo: "bar", collection: this.collection});
                })
            });

            context("when no contentDetails is provided", function () {
                beforeEach(function () {
                    spyOn(chorus.views, "ListContentDetails")
                    this.view = new chorus.views.MainContentList({ collection:this.collection, modelClass:"Workfile" });
                })

                it("creates a ListContentDetails view", function () {
                    expect(chorus.views.ListContentDetails).toHaveBeenCalled();
                })
            })

            context("when a custom contentDetails is provided", function () {
                beforeEach(function () {
                    spyOn(chorus.views, "ListContentDetails")
                    this.contentDetails = stubView();
                    this.view = new chorus.views.MainContentList({ collection:this.collection, modelClass:"Workfile", contentDetails:this.contentDetails });
                })

                it("does not create a ListContentDetails view", function () {
                    expect(chorus.views.ListContentDetails).not.toHaveBeenCalled();
                })

                it("uses the custom contentDetails", function () {
                    expect(this.view.contentDetails).toBe(this.contentDetails);
                })

                it("does not construct a contentFooter", function () {
                    expect(this.view.contentFooter).toBeUndefined();
                })
            })
        })
    })

    describe("ListHeaderView", function () {
        beforeEach(function () {
            this.view = new chorus.views.ListHeaderView({
                title:"Hi there",
                linkMenus:{
                    type:{
                        title:"Title",
                        options:[
                            {data:"", text:"All"},
                            {data:"sql", text:"SQL"}
                        ],
                        event:"filter"
                    }
                }
            });
        });

        describe("#render", function () {
            beforeEach(function () {
                this.view.render();
            })

            it("renders link menus", function () {
                expect(this.view.$(".menus ul[data-event=filter]")).toExist();
            })

            it("renders the header title", function () {
                expect(this.view.$("h1").text().trim()).toBe("Hi there")
            })

            it("does not render an image", function () {
                expect(this.view.$(".icon")).not.toExist();
            })

            context("when an imageUrl is provided", function () {
                beforeEach(function () {
                    this.view.options.imageUrl = "edc/image/foo/bar.png";
                    this.view.render();
                })

                it("renders the image", function () {
                    expect(this.view.$(".icon")).toHaveAttr("src", "edc/image/foo/bar.png")
                })
            });
        })

        describe("event propagation", function () {
            beforeEach(function () {
                this.view.render();
            })

            it("propagates choice events as choice: events", function () {
                this.choiceSpy = jasmine.createSpy("choice:filter")
                this.view.bind("choice:filter", this.choiceSpy);
                this.view.$("li[data-type=sql] a").click();
                expect(this.choiceSpy).toHaveBeenCalledWith("sql");
            })

        })

    });

    describe("loading section", function () {
        beforeEach(function () {
            this.view = new chorus.views.Bare();
            this.view.className = "plain_text";
            this.view.context = function () {
                return { text:"Foo" };
            }
        });

        describe("rendering the loading section", function () {
            context("when displayLoadingSection returns true", function () {
                beforeEach(function () {
                    this.view.context = jasmine.createSpy('context');
                    this.view.subviews = {".asdf":"fdsa"};
                    spyOn(this.view, 'getSubview').andCallThrough();
                    this.view.displayLoadingSection = function () {
                        return true;
                    }
                });

                it("does not call context", function () {
                    this.view.render();
                    expect(this.view.context).not.toHaveBeenCalled();
                });

                it("does not render regular subviews", function () {
                    this.view.render();
                    expect(this.view.getSubview).toHaveBeenCalledWith('makeLoadingSectionView');
                    expect(this.view.getSubview.callCount).toBe(1);
                });

                it("renders the loading template", function () {
                    this.view.render();
                    expect(this.view.$('.loading_section').length).toBe(1)
                });

                context("when makeLoadingSectionView is overridden", function () {
                    beforeEach(function () {
                        var otherView = this.otherView = new chorus.views.Base();
                        spyOn(this.otherView, 'render').andReturn({el:$("<div/>")});

                        this.view.makeLoadingSectionView = function () {
                            return otherView;
                        }
                    });

                    it("renders what is returned by makeLoadingSectionView", function () {
                        this.view.render();
                        expect(this.otherView.render).toHaveBeenCalled();
                    });
                });

                context("when loadingSectionOptions is overridden", function () {
                    beforeEach(function () {
                        this.view.loadingSectionOptions = function () {
                            return {delay:9000};
                        }

                        var origSection = chorus.views.LoadingSection;
                        spyOn(chorus.views, "LoadingSection").andReturn(new origSection());
                    });

                    it("passes those options to the LoadingSection constructor", function () {
                        this.view.render();
                        expect(chorus.views.LoadingSection).toHaveBeenCalledWith({delay:9000});
                    });
                });
            });

            context("when displayLoadingSection returns false", function () {
                beforeEach(function () {
                    this.view.displayLoadingSection = function () {
                        return false;
                    }
                    this.view.render();
                });

                it("renders the 'normal' template", function () {
                    expect($(this.view.el).text()).toBe("Foo");
                    expect(this.view.$('.loading_section').length).toBe(0)
                });
            });
        });
    });

    describe("chorus.views.Base", function () {
        describe("displayLoadingSection", function () {
            beforeEach(function () {
                this.model = new chorus.models.Base();
                this.view = new chorus.views.Base({model:this.model});
            });

            it("returns false by default", function () {
                expect(this.view.displayLoadingSection()).toBeFalsy();
            });

            context("when the view has useLoadingSection set to true", function () {
                beforeEach(function () {
                    this.view.useLoadingSection = true;
                });

                context("when there are requiredResources", function () {
                    beforeEach(function () {
                        this.resource = fixtures.user();
                        this.view.requiredResources.push(this.resource);
                        spyOn(this.view.requiredResources, 'allLoaded');
                    })

                    it("returns true if the resources are not yet loaded", function () {
                        this.view.requiredResources.allLoaded.andReturn(false);
                        expect(this.view.displayLoadingSection()).toBeTruthy();
                    })

                    it("returns false if the resources are loaded", function () {
                        this.view.requiredResources.allLoaded.andReturn(true);
                        expect(this.view.displayLoadingSection()).toBeFalsy();
                    })
                })

                context("when there are no requiredResources", function () {
                    it("returns the opposite of view.resource.loaded", function () {
                        this.model.loaded = false;
                        expect(this.view.displayLoadingSection()).toBeTruthy();

                        this.model.loaded = true;
                        expect(this.view.displayLoadingSection()).toBeFalsy();
                    });

                    it("returns false when the view does not have a resource", function () {
                        delete this.view.resource;
                        expect(this.view.displayLoadingSection()).toBeFalsy();
                    });
                })
            });
        });

        describe("placeholder", function() {
            beforeEach(function() {
                this.view = new chorus.views.Base();
                this.view.className = "plain_text";
                spyOn(chorus, 'placeholder');
                this.view.render();
            })

            it("sets up input placeholders for older browsers", function() {
                expect(chorus.placeholder).toHaveBeenCalledWith(this.view.$("input[placeholder], textarea[placeholder]"));
            });
        })
    });

    describe("chorus.views.Bare", function () {
        describe("#setupScrolling", function () {
            beforeEach(function () {
                this.page = new chorus.pages.Base();
                chorus.page = this.page;
                this.view = new chorus.views.Bare();
                this.view.template = function () {
                    return "<div class='foo'><div class='subfoo'/></div>"
                };
                this.view.subviews = { ".subfoo":"subfoo" }
                this.view.subfoo = new chorus.views.Bare();
                this.view.subfoo.className = "plain_text"
                this.view.render();
                stubDefer();

                spyOn($.fn, "jScrollPane").andCallThrough();
                spyOn($.fn, "hide").andCallThrough();
                spyOn($.fn, "bind").andCallThrough();
                spyOn(this.page, "bind").andCallThrough();
                spyOn(this.view, "recalculateScrolling").andCallThrough();
                this.view.setupScrolling(".foo")
            });

            it("defers the setup", function () {
                expect(_.defer).toHaveBeenCalled();
            })

            it("calls jScrollPane", function () {
                expect($.fn.jScrollPane).toHaveBeenCalledOnSelector(".foo");
            })

            it("adds the custom_scroll class to the element", function () {
                expect($(this.view.$(".foo"))).toHaveClass("custom_scroll")
            })

            it("hides the scrollbars initially", function () {
                expect($.fn.hide).toHaveBeenCalledOnSelector(".foo .jspVerticalBar");
                expect($.fn.hide).toHaveBeenCalledOnSelector(".foo .jspHorizontalBar");
            })

            it("binds the view to resized events on the page", function () {
                expect(this.page.bind).toHaveBeenCalledWith("resized", jasmine.any(Function), jasmine.any(Object));
            })

            it("binds to the mousewheel event on the container", function () {
                expect($.fn.bind).toHaveBeenCalledOnSelector(".foo .jspContainer");
                expect($.fn.bind).toHaveBeenCalledWith("mousewheel", jasmine.any(Function));
            })

            context("when called again", function () {
                beforeEach(function () {
                    this.page.bind.reset();
                    $.fn.hide.reset();
                    $.fn.jScrollPane.reset();
                    $.fn.bind.reset();
                    this.view.setupScrolling(".foo")
                });

                it("calls jScrollPane", function () {
                    expect($.fn.jScrollPane).toHaveBeenCalledOnSelector(".foo");
                })

                it("hides the scrollbars initially", function () {
                    expect($.fn.hide).toHaveBeenCalledOnSelector(".foo .jspVerticalBar");
                    expect($.fn.hide).toHaveBeenCalledOnSelector(".foo .jspHorizontalBar");
                })

                it("does not re-bind the view to resized events on the page", function () {
                    expect(this.page.bind).not.toHaveBeenCalledWith("resized", jasmine.any(Function), jasmine.any(Object));
                })

                it("does not re-bind to the mousewheel event on the container", function () {
                    expect($.fn.bind).not.toHaveBeenCalledOnSelector(".foo .jspContainer");
                })
            })

            describe("when a resized event occurs", function () {
                beforeEach(function () {
                    spyOn(this.view.$(".foo").data("jsp"), "reinitialise")
                    this.page.trigger("resized");
                });

                it("recalculates scrolling", function () {
                    expect(this.view.$(".foo").data("jsp").reinitialise).toHaveBeenCalled();
                })
            })

            describe("when a mousewheel event occurs", function () {
                beforeEach(function () {
                    this.event = jQuery.Event("mousewheel");
                    this.view.$(".jspContainer").trigger(this.event)
                });

                it("prevents default", function () {
                    expect(this.event.isDefaultPrevented()).toBeTruthy();
                })
            })

            describe("when a subview is re-rendered", function () {
                beforeEach(function () {
                    this.view.recalculateScrolling.reset();
                    this.view.subfoo.render()
                });

                it("recalculates scrolling", function () {
                    expect(this.view.recalculateScrolling).toHaveBeenCalled()
                })
            })

            describe("when a subview triggers content:changed", function() {
                beforeEach(function () {
                    this.view.recalculateScrolling.reset();
                    this.view.subfoo.trigger("content:changed");
                });

                it("recalculates scrolling", function () {
                    expect(this.view.recalculateScrolling).toHaveBeenCalled()
                })
            })

            describe("when the element scrolls", function() {
                beforeEach(function() {
                    spyOnEvent(this.view, 'scroll');
                    this.view.$(".foo").trigger("jsp-scroll-y");
                });

                it("triggers the 'scroll' event on itself", function() {
                    expect('scroll').toHaveBeenTriggeredOn(this.view);
                });
            });
        })
    })
})
