describe("chorus.Mixins", function() {

    describe("Events", function() {
        describe("forwardEvent", function() {
            beforeEach(function() {
                this.source = {};
                this.target = {};

                _.extend(this.source, Backbone.Events, chorus.Mixins.Events);
                _.extend(this.target, Backbone.Events, chorus.Mixins.Events);

                this.source.forwardEvent("my_event", this.target);
            });

            it("triggers the event on the target, when the source is triggered", function() {
                spyOnEvent(this.target, "my_event");
                this.source.trigger("my_event");

                expect("my_event").toHaveBeenTriggeredOn(this.target);
            });

            it("triggers the event on the target, when the source is triggered, retaining arguments", function() {
                var obj = {}
                var spy = function(arg1, arg2) {
                    obj.arg1 = arg1
                    obj.arg2 = arg2
                }

                this.target.bind("my_event", spy);
                this.source.trigger("my_event", 1, 2);

                expect(obj.arg1).toBe(1);
                expect(obj.arg2).toBe(2);
            });
        });

        describe("bindOnce", function() {
            beforeEach(function() {
                this.source = {};
                _.extend(this.source, Backbone.Events, chorus.Mixins.Events);
                this.callback = jasmine.createSpy("callbackBoundOnce");
            });

            describe("with no bind context", function() {
                beforeEach(function() {
                    this.source.bindOnce("increment", this.callback);
                });

                itPassesArgumentsCorrectly();
                itCallsTheBoundFunctionOnlyOnce();
                itTriggersOnlyOnMatchingEventName();
                itUnbindsCorrectly();
            });

            describe("with a bind context", function() {
                beforeEach(function() {
                    this.source.bindOnce("increment", this.callback, this);
                });

                itPassesArgumentsCorrectly();
                itCallsTheBoundFunctionOnlyOnce();
                itTriggersOnlyOnMatchingEventName();
                itUnbindsCorrectly();
            });

            describe("when #bindOnce is called more than once", function() {
                beforeEach(function() {
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
                it("passes arguments correctly", function() {
                    this.source.trigger("increment", 'foo');
                    expect(this.callback).toHaveBeenCalledWith('foo');
                });
            }

            function itCallsTheBoundFunctionOnlyOnce() {
                it("calls the bound function only once over multiple triggers", function() {
                    this.source.trigger("increment", 'foo');
                    this.source.trigger("increment", 'bar');
                    this.source.trigger("increment", 'baz');

                    expect(this.callback.callCount).toBe(1);
                });
            }

            function itTriggersOnlyOnMatchingEventName() {
                it("does not call the function when a different trigger occurs", function() {
                    this.source.trigger("foobar");
                    expect(this.callback).not.toHaveBeenCalled();
                });
            }

            function itUnbindsCorrectly() {
                describe("unbinding", function() {
                    it("unbinds after the first call", function() {
                        this.source.trigger("increment", 'baz');
                        expect(this.callback.callCount).toBe(1);

                        this.source.trigger("increment", 'baz');
                        this.source.trigger("increment", 'baz');
                        expect(this.callback.callCount).toBe(1);
                    });
                });
            }
        });

        describe("onLoaded", function() {
            beforeEach(function() {
                this.source = {};
                _.extend(this.source, Backbone.Events, chorus.Mixins.Events);
                this.callback = jasmine.createSpy('callback');
                spyOn(this.source, 'bind');
            });
            context("when object is not loaded", function() {
                beforeEach(function() {
                    this.source.loaded = false;
                });

                it("binds the callback to loaded if the object is not yet loaded", function() {
                    var otherContext = {};
                    this.source.onLoaded(this.callback, otherContext);
                    expect(this.callback).not.toHaveBeenCalled();
                    expect(this.source.bind).toHaveBeenCalledWith('loaded', this.callback, otherContext);
                });
            });

            context("when object is loaded", function() {
                beforeEach(function() {
                    this.source.loaded = true;
                });

                it("executes the callback in the context, if the object is already loaded", function() {
                    stubDefer();
                    var otherContext = {};
                    this.source.onLoaded(this.callback, otherContext);
                    waitForCallback(this.callback);
                    expect(this.callback).toHaveBeenCalled();
                    expect(this.callback.mostRecentCall.object).toBe(otherContext);
                });

                it("defers the execution of the callback so behavior is more consistent", function() {
                    this.source.onLoaded(this.callback);
                    expect(this.callback).not.toHaveBeenCalled();
                    waitForCallback(this.callback);
                    runs(function() { expect(this.callback).toHaveBeenCalled() });
                });

                it("works when there is no context", function() {
                    stubDefer();
                    this.source.onLoaded(this.callback);
                    expect(this.callback).toHaveBeenCalled();
                });
            })

        });
    });

    describe("Urls", function() {
        beforeEach(function() {
            this.object = fixtures.workfile({ id: '45' });
        });

        describe("#showUrl", function() {
            context("when showUrlTemplate is not set", function() {
                beforeEach(function() {
                    this.object.showUrlTemplate = null;
                })

                it("throws an exception", function() {
                    expect(this.object.showUrl).toThrow("No showUrlTemplate defined");
                });
            })

            context("when showUrlTemplate is a function", function() {
                beforeEach(function() {
                    this.object.showUrlTemplate = function() {
                        return "my_items/show/foo/{{id}}";
                    }
                })

                it("calls the function ", function() {
                    expect(this.object.showUrl()).toBe("#/my_items/show/foo/45")
                });
            })

            context("when showUrlTemplate is not a function", function() {
                beforeEach(function() {
                    this.object.showUrlTemplate = "my_items/show/{{id}}";
                })

                it("returns #/{{showUrlTemplate}}", function() {
                    this.object.showUrlTemplate = "my_items/show/{{id}}";
                    expect(this.object.showUrl()).toBe("#/my_items/show/45")
                });
            });
        });
    });

    describe("dbHelpers", function() {
        context("with uppercase", function() {
            it("should displays quotes around the name", function() {
                expect(chorus.Mixins.dbHelpers.safePGName("Hello")).toBe('"Hello"');
            });
        });
        context("with all lowercase", function() {
            it("should not displays quotes around the name", function() {
                expect(chorus.Mixins.dbHelpers.safePGName("hello")).toBe('hello');
            });
        });
        context("with a number as the first character", function() {
            it("should display quotes around the name", function() {
                expect(chorus.Mixins.dbHelpers.safePGName("1up")).toBe('"1up"');
            })
        })

    });

    describe("SQLResults", function() {
        describe("#errorMessage", function() {
            context("when the host provides a custom getErrors function ", function() {
                beforeEach(function() {
                    this.hostModel = chorus.models.Base.extend(_.extend({}, chorus.Mixins.SQLResults, {
                        getErrors: function() {
                            return this.get("error");
                        }
                    }));
                });

                context("when the execution fails", function() {
                    beforeEach(function() {
                        this.host = new this.hostModel({
                            error: {
                                executeResult: "error",
                                message: "Foo"
                            }
                        });
                    });

                    it("returns the error message", function() {
                        expect(this.host.errorMessage()).toBe("Foo");
                    });
                });

                context("when the execution suceeds", function() {
                    beforeEach(function() {
                        this.host = new this.hostModel({
                            error: {
                                executeResult: "success",
                                message: "Executed in 2 seconds"
                            }
                        });
                    });

                    it("returns the error message", function() {
                        expect(this.host.errorMessage()).toBeFalsy();
                    });
                });

                context("when there is no status or message in the response", function() {
                    beforeEach(function() {
                        this.host = new this.hostModel({
                            error: {
                            }
                        });
                    });

                    it("returns the error message", function() {
                        expect(this.host.errorMessage()).toBeFalsy();
                    });
                });
            });

            context("when the host does not provide a custom getErrors function", function() {
                beforeEach(function() {
                    this.hostModel = chorus.models.Base.extend(_.extend({}, chorus.Mixins.SQLResults, {
                    }));
                });

                context("when the execution fails", function() {
                    beforeEach(function() {
                        this.host = new this.hostModel({
                            executeResult: "error",
                            message: "Foo"
                        });
                    });

                    it("returns the error message", function() {
                        expect(this.host.errorMessage()).toBe("Foo");
                    });
                });

                context("when the execution suceeds", function() {
                    beforeEach(function() {
                        this.host = new this.hostModel({
                            executeResult: "success",
                            message: "Executed in 2 seconds"
                        });
                    });

                    it("returns the error message", function() {
                        expect(this.host.errorMessage()).toBeFalsy();
                    });
                });

                context("when there is no status or message in the response", function() {
                    beforeEach(function() {
                        this.host = new this.hostModel({
                        });
                    });

                    it("returns the error message", function() {
                        expect(this.host.errorMessage()).toBeFalsy();
                    });
                });
            });
        });

        describe("#columnOrientedData", function() {
            context("when the host provides custom functions", function() {
                beforeEach(function() {
                    this.hostModel = chorus.models.Base.extend(_.extend({}, chorus.Mixins.SQLResults, {
                        getRows: function() {
                            return this.get("r");
                        },

                        getColumns: function() {
                            return this.get("c");
                        },

                        getSortedRows: function(rows) {
                            return _.sortBy(rows, function(row) {
                                return -1 * row.foo;
                            });
                        },

                        getColumnLabel: function(name) {
                            switch (name) {
                                case "foo":
                                    return "A Foo";
                                case "bar":
                                    return "A Bar";
                                default:
                                    return name;
                            }
                        }
                    }));

                    this.host = new this.hostModel({
                        c: [
                            {
                                name: "foo",
                                typeCategory: "whatever"
                            },
                            {
                                name: "bar",
                                typeCategory: "what"
                            }
                        ],

                        r: [
                            {
                                "foo": 1,
                                "bar": 3
                            },
                            {
                                "foo": 2,
                                "bar": 4
                            }
                        ]
                    });
                });

                it("returns an array of columns containing data", function() {
                    var val = this.host.columnOrientedData();
                    expect(val.length).toBe(2);

                    expect(val[0].name).toBe("A Foo");
                    expect(val[0].type).toBe("whatever");
                    expect(val[0].values.length).toBe(2);
                    expect(val[0].values[0]).toBe(2);
                    expect(val[0].values[1]).toBe(1);

                    expect(val[1].name).toBe("A Bar");
                    expect(val[1].type).toBe("what");
                    expect(val[1].values.length).toBe(2);
                    expect(val[1].values[0]).toBe(4);
                    expect(val[1].values[1]).toBe(3);
                })
            })
            context("when the host does not provide custom functions", function() {
                beforeEach(function() {
                    this.hostModel = chorus.models.Base.extend(_.extend({}, chorus.Mixins.SQLResults, {
                    }));

                    this.host = new this.hostModel({
                        columns: [
                            {
                                name: "foo",
                                typeCategory: "whatever"
                            },
                            {
                                name: "bar",
                                typeCategory: "what"
                            }
                        ],

                        rows: [
                            {
                                "foo": 1,
                                "bar": 3
                            },
                            {
                                "foo": 2,
                                "bar": 4
                            }
                        ]
                    });
                });

                it("provides reasonable defaults", function() {
                    var val = this.host.columnOrientedData();
                    expect(val.length).toBe(2);

                    expect(val[0].name).toBe("foo");
                    expect(val[0].type).toBe("whatever");
                    expect(val[0].values.length).toBe(2);
                    expect(val[0].values[0]).toBe(1);
                    expect(val[0].values[1]).toBe(2);

                    expect(val[1].name).toBe("bar");
                    expect(val[1].type).toBe("what");
                    expect(val[1].values.length).toBe(2);
                    expect(val[1].values[0]).toBe(3);
                    expect(val[1].values[1]).toBe(4);
                })
            })
        })
    });

    describe("VisHelpers", function() {
        describe("#labelFormat", function() {
            beforeEach(function() {
                this.hostView = _.extend(chorus.views.visualizations.XAxis, chorus.Mixins.VisHelpers);
            })
            it("returns a string if given a string", function() {
                expect(this.hostView.labelFormat("fooooooo", 6)).toBe("fooooooo", 6)
            })
            it("returns a number if given a number", function() {
                expect(this.hostView.labelFormat(13.45)).toEqual(13.45)
            })
            it("returns a number if given a relatively long number", function() {
                expect(this.hostView.labelFormat(12.678)).toEqual(12.678)
            })
            it("returns an exponential if given a long number", function() {
                expect(this.hostView.labelFormat(123245.67890)).toEqual("1.23e+5")
            })
            it("returns an exponential if given a number longer than spec", function() {
                expect(this.hostView.labelFormat(123.2, 2)).toEqual("1.23e+2")
            })
            it("returns an ellipsized string if given a long string", function() {
                expect(this.hostView.labelFormat("abcdefghij", 4, 4)).toEqual("abcd...");
            })

        })
    })

    function waitForCallback(callback) {
        waitsFor(function() { return callback.callCount });
    }
});
