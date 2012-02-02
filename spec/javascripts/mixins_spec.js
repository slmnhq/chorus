describe("chorus.Mixins", function () {

    describe("Events", function () {
        describe("forwardEvent", function () {
            beforeEach(function () {
                this.source = {};
                this.target = {};

                _.extend(this.source, Backbone.Events, chorus.Mixins.Events);
                _.extend(this.target, Backbone.Events, chorus.Mixins.Events);

                this.source.forwardEvent("my_event", this.target);
            });

            it("triggers the event on the target, when the source is triggered", function () {
                spyOnEvent(this.target, "my_event");
                this.source.trigger("my_event");

                expect("my_event").toHaveBeenTriggeredOn(this.target);
            });

            it("triggers the event on the target, when the source is triggered, retaining arguments", function () {
                var obj = {}
                var spy = function (arg1, arg2) {
                    obj.arg1 = arg1
                    obj.arg2 = arg2
                }

                this.target.bind("my_event", spy);
                this.source.trigger("my_event", 1, 2);

                expect(obj.arg1).toBe(1);
                expect(obj.arg2).toBe(2);
            });
        });

        describe("bindOnce", function () {
            beforeEach(function () {
                this.source = {};
                _.extend(this.source, Backbone.Events, chorus.Mixins.Events);
                this.callback = jasmine.createSpy("callbackBoundOnce");
            });

            describe("with no bind context", function () {
                beforeEach(function () {
                    this.source.bindOnce("increment", this.callback);
                });

                itPassesArgumentsCorrectly();
                itCallsTheBoundFunctionOnlyOnce();
                itTriggersOnlyOnMatchingEventName();
                itUnbindsCorrectly();
            });

            describe("with a bind context", function () {
                beforeEach(function () {
                    this.source.bindOnce("increment", this.callback, this);
                });

                itPassesArgumentsCorrectly();
                itCallsTheBoundFunctionOnlyOnce();
                itTriggersOnlyOnMatchingEventName();
                itUnbindsCorrectly();
            });

            describe("when #bindOnce is called more than once", function () {
                beforeEach(function () {
                    this.source.bindOnce("increment", this.callback, this);
                    this.source.bindOnce("increment", this.callback, this);
                    this.source.bindOnce("increment", this.callback, this);
                });

                itPassesArgumentsCorrectly();
                itCallsTheBoundFunctionOnlyOnce();
                itTriggersOnlyOnMatchingEventName();
                itUnbindsCorrectly();
            });

            function itPassesArgumentsCorrectly() {
                it("passes arguments correctly", function () {
                    this.source.trigger("increment", 'foo');
                    expect(this.callback).toHaveBeenCalledWith('foo');
                });
            }

            function itCallsTheBoundFunctionOnlyOnce() {
                it("calls the bound function only once over multiple triggers", function () {
                    this.source.trigger("increment", 'foo');
                    this.source.trigger("increment", 'bar');
                    this.source.trigger("increment", 'baz');

                    expect(this.callback.callCount).toBe(1);
                });
            }

            function itTriggersOnlyOnMatchingEventName() {
                it("does not call the function when a different trigger occurs", function () {
                    this.source.trigger("foobar");
                    expect(this.callback).not.toHaveBeenCalled();
                });
            }

            function itUnbindsCorrectly() {
                describe("unbinding", function () {
                    it("unbinds after the first call", function () {
                        this.source.trigger("increment", 'baz');
                        expect(this.callback.callCount).toBe(1);

                        this.source.trigger("increment", 'baz');
                        this.source.trigger("increment", 'baz');
                        expect(this.callback.callCount).toBe(1);
                    });
                });
            }
        });

        describe("onLoaded", function () {
            beforeEach(function () {
                this.source = {};
                _.extend(this.source, Backbone.Events, chorus.Mixins.Events);
                this.callback = jasmine.createSpy('callback');
                spyOn(this.source, 'bind');
            });
            context("when object is not loaded", function () {
                beforeEach(function () {
                    this.source.loaded = false;
                });

                it("binds the callback to loaded if the object is not yet loaded", function () {
                    var otherContext = {};
                    this.source.onLoaded(this.callback, otherContext);
                    expect(this.callback).not.toHaveBeenCalled();
                    expect(this.source.bind).toHaveBeenCalledWith('loaded', this.callback, otherContext);
                });
            });

            context("when object is loaded", function () {
                beforeEach(function () {
                    this.source.loaded = true;
                });

                it("executes the callback in the context, if the object is already loaded", function () {
                    var otherContext = {};
                    this.source.onLoaded(this.callback, otherContext);
                    expect(this.callback).toHaveBeenCalled();
                    expect(this.callback.mostRecentCall.object).toBe(otherContext);
                });

                it("works when there is no context", function () {
                    this.source.onLoaded(this.callback);
                    expect(this.callback).toHaveBeenCalled();
                });
            })

        });
    });

    describe("Urls", function () {
        beforeEach(function () {
            this.object = fixtures.workfile({ id:'45' });
        });

        describe("#showUrl", function () {
            context("when showUrlTemplate is not set", function () {
                beforeEach(function () {
                    this.object.showUrlTemplate = null;
                })

                it("throws an exception", function () {
                    expect(this.object.showUrl).toThrow("No showUrlTemplate defined");
                });
            })

            context("when showUrlTemplate is a function", function () {
                beforeEach(function () {
                    this.object.showUrlTemplate = function () {
                        return "my_items/show/foo/{{id}}";
                    }
                })

                it("calls the function ", function () {
                    expect(this.object.showUrl()).toBe("#/my_items/show/foo/45")
                });
            })

            context("when showUrlTemplate is not a function", function () {
                beforeEach(function () {
                    this.object.showUrlTemplate = "my_items/show/{{id}}";
                })

                it("returns #/{{showUrlTemplate}}", function () {
                    this.object.showUrlTemplate = "my_items/show/{{id}}";
                    expect(this.object.showUrl()).toBe("#/my_items/show/45")
                });
            });
        });
    });

    describe("dbHelpers", function () {
        context("with uppercase", function () {
            it("should displays quotes around the name", function () {
                expect(chorus.Mixins.dbHelpers.safePGName("Hello")).toBe('"Hello"');
            });
        });
        context("with all lowercase", function () {
            it("should not displays quotes around the name", function () {
                expect(chorus.Mixins.dbHelpers.safePGName("hello")).toBe('hello');
            });
        });
        context("with a number as the first character", function () {
            it("should display quotes around the name", function () {
                expect(chorus.Mixins.dbHelpers.safePGName("1up")).toBe('"1up"');
            })
        })

    });

    describe("SQLResults", function () {
        describe("#columnOrientedData", function () {
            context("when the host provides custom getRows and getColumns functions", function () {
                beforeEach(function () {
                    this.hostModel = chorus.models.Base.extend(_.extend({}, chorus.Mixins.SQLResults, {
                        getRows : function () {
                            return this.get("r");
                        },

                        getColumns : function () {
                            console.log(this.attributes);
                            return this.get("c");
                        }
                    }));

                    this.host = new this.hostModel({
                        c:[
                            {
                                name:"foo",
                                typeCategory:"whatever"
                            },
                            {
                                name:"bar",
                                typeCategory:"what"
                            }
                        ],

                        r:[
                            {
                                "foo":"value1",
                                "bar":"bar1"
                            },
                            {
                                "foo":"value2",
                                "bar":"bar2"
                            }
                        ]
                    });
                });

                it("returns an array of columns containing data", function () {
                    var val = this.host.columnOrientedData();
                    expect(val.length).toBe(2);

                    expect(val[0].name).toBe("foo");
                    expect(val[0].type).toBe("whatever");
                    expect(val[0].values.length).toBe(2);
                    expect(val[0].values[0]).toBe("value1");
                    expect(val[0].values[1]).toBe("value2");

                    expect(val[1].name).toBe("bar");
                    expect(val[1].type).toBe("what");
                    expect(val[1].values.length).toBe(2);
                    expect(val[1].values[0]).toBe("bar1");
                    expect(val[1].values[1]).toBe("bar2");
                })
            })
            context("when the host does not provide custom getRows and getColumns functions", function () {
                beforeEach(function () {
                    this.hostModel = chorus.models.Base.extend(_.extend({}, chorus.Mixins.SQLResults, {
                    }));

                    this.host = new this.hostModel({
                        columns:[
                            {
                                name:"foo",
                                typeCategory:"whatever"
                            },
                            {
                                name:"bar",
                                typeCategory:"what"
                            }
                        ],

                        rows:[
                            {
                                "foo":"value1",
                                "bar":"bar1"
                            },
                            {
                                "foo":"value2",
                                "bar":"bar2"
                            }
                        ]
                    });
                });

                it("provides reasonable defaults", function () {
                    var val = this.host.columnOrientedData();
                    expect(val.length).toBe(2);

                    expect(val[0].name).toBe("foo");
                    expect(val[0].type).toBe("whatever");
                    expect(val[0].values.length).toBe(2);
                    expect(val[0].values[0]).toBe("value1");
                    expect(val[0].values[1]).toBe("value2");

                    expect(val[1].name).toBe("bar");
                    expect(val[1].type).toBe("what");
                    expect(val[1].values.length).toBe(2);
                    expect(val[1].values[0]).toBe("bar1");
                    expect(val[1].values[1]).toBe("bar2");
                })
            })
        })
    });
}) ;
