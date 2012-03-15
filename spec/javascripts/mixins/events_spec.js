describe("chorus.Mixins.Events", function() {
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
        var fakeContext = function(name) {this.name = name};
        beforeEach(function() {
            this.source = {};
            _.extend(this.source, Backbone.Events, chorus.Mixins.Events);
            this.callback = jasmine.createSpy("callbackBoundOnce");
            this.context1 = new fakeContext('context1');
            this.context2 = new fakeContext('context2');
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
        describe("when #bindOnce is called more than once with a different context", function() {
            beforeEach(function() {
                this.source.bindOnce("increment", this.callback, this.context1);
                this.source.bindOnce("increment", this.callback, this.context2);
            });

            it("calls each function one time in the correct context", function() {
                this.source.trigger('increment', 'foo');
                this.source.trigger('increment', 'bar');
                expect(this.callback.callCount).toBe(2);
                expect(this.callback.calls[0].args[0]).toBe('foo');
                expect(this.callback.calls[0].object).toBe(this.context1);
                expect(this.callback.calls[1].args[0]).toBe('foo');
                expect(this.callback.calls[1].object).toBe(this.context2);
            });
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

    function waitForCallback(callback) {
        waitsFor(function() { return callback.callCount });
    }
});

