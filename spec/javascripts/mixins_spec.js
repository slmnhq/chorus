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
            describe("with no bind context", function() {
                beforeEach(function() {
                    this.source = {};

                    _.extend(this.source, Backbone.Events, chorus.Mixins.Events);

                    this.counter = 0;

                    var self = this;
                    var inc = function(value) {
                        self.counter += value;
                    }

                    this.source.bindOnce("increment", inc);
                });

                itPassesArgumentsCorrectly();
                itCallsTheBoundFunctionOnlyOnce();
                itTriggersOnlyOnMatchingEventName();
                itUnbindsCorrectly();
            });

            describe("with a bind context", function() {
                beforeEach(function() {
                    this.source = {};

                    _.extend(this.source, Backbone.Events, chorus.Mixins.Events);

                    this.counter = 0;

                    var inc = function(value) {
                        this.counter += value;
                    }

                    this.source.bindOnce("increment", inc, this);
                });

                itPassesArgumentsCorrectly();
                itCallsTheBoundFunctionOnlyOnce();
                itTriggersOnlyOnMatchingEventName();
                itUnbindsCorrectly();
            });

            function itPassesArgumentsCorrectly() {
                it("passes arguments correctly", function() {
                    this.source.trigger("increment", 5);

                    expect(this.counter).toBe(5);
                });
            };

            function itCallsTheBoundFunctionOnlyOnce() {
                it("calls the bound function only once over multiple triggers", function() {
                    this.source.trigger("increment", 1);

                    expect(this.counter).toBe(1);

                    this.source.trigger("increment", 2);

                    expect(this.counter).toBe(1);
                });
            };

            function itTriggersOnlyOnMatchingEventName() {
                it("does not call the function when a different trigger occurs", function() {
                    this.source.trigger("foobar");

                    expect(this.counter).toBe(0);
                });
            };

            function itUnbindsCorrectly() {
                describe("unbinding", function() {
                    beforeEach(function() {
                        var source = this.source;
                        spyOn(this.source, "unbind");
                        this.boundFunc = function() {
                        };

                        this.source.bindOnce("foo", this.boundFunc);
                    });

                    it("unbinds after the first call", function() {
                        expect(this.source.unbind).not.toHaveBeenCalled();

                        // We can't assert that the specific function has been provided to unbind
                        // because it will have been modified already.
                        this.source.trigger("foo");
                        expect(this.source.unbind).toHaveBeenCalled();
                    });
                });
            }
        });
    });

    describe("Urls", function() {
        beforeEach(function() {
            this.object = fixtures.workfile({ id: '45' });
        });

        describe("#showUrl", function() {
            it("returns #/{{showUrlTemplate}}", function() {
                this.object.showUrlTemplate = "my_items/show/{{id}}";
                expect(this.object.showUrl()).toBe("#/my_items/show/45")
            });

            it("throws when showUrlTemplate is not set", function() {
                expect(this.object.showUrl).toThrow("No showUrlTemplate defined");
            });
        });
    });
});
