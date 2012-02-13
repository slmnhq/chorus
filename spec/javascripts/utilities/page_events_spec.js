describe("chorus.PageEvents", function() {
    describe("#subscribe, #broadcast, and #reset", function() {
        beforeEach(function() {
            chorus.PageEvents.reset();
            this.subscriber1 = new chorus.models.Base();
            this.subscriber1.method = jasmine.createSpy();

            this.subscriber2 = new chorus.models.Base();
            this.subscriber2.method = jasmine.createSpy();
        });

        it("removes all subscriptions", function() {
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            chorus.PageEvents.subscribe("foo", this.subscriber2.method, this.subscriber2);

            chorus.PageEvents.reset();
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).not.toHaveBeenCalled();
            expect(this.subscriber2.method).not.toHaveBeenCalled();
        });

        it("properly binds and triggers one event", function() {
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).toHaveBeenCalled();
            expect(this.subscriber1.method.mostRecentCall.object).toBe(this.subscriber1);
        });

        it("properly binds and trigger multiple events", function() {
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            chorus.PageEvents.subscribe("foo", this.subscriber2.method, this.subscriber2);
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).toHaveBeenCalled();
            expect(this.subscriber2.method).toHaveBeenCalled();
            expect(this.subscriber1.method.mostRecentCall.object).toBe(this.subscriber1);
            expect(this.subscriber2.method.mostRecentCall.object).toBe(this.subscriber2);
        });

        it("unsubscribes single events correctly", function() {
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            var handle = chorus.PageEvents.subscribe("foo", this.subscriber2.method, this.subscriber2);
            chorus.PageEvents.unsubscribe(handle);

            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).toHaveBeenCalled();
            expect(this.subscriber2.method).not.toHaveBeenCalled();
            expect(this.subscriber1.method.mostRecentCall.object).toBe(this.subscriber1);
        });

        it("handles resubscribing to an event", function() {
            var handle = chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).toHaveBeenCalled();
            expect(chorus.PageEvents.subscriptions.foo.length).toBe(1);

            this.subscriber1.method.reset();
            chorus.PageEvents.unsubscribe(handle);
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).not.toHaveBeenCalled();
            expect(chorus.PageEvents.subscriptions.foo.length).toBe(0);

            this.subscriber1.method.reset();
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).toHaveBeenCalled();
            expect(chorus.PageEvents.subscriptions.foo.length).toBe(1);
        });

        it("passes arguments when broadcast", function() {
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            chorus.PageEvents.broadcast("foo", ["Foo", "Bar"]);
            expect(this.subscriber1.method).toHaveBeenCalled();
            expect(this.subscriber1.method.mostRecentCall.object).toBe(this.subscriber1);
            expect(this.subscriber1.method.mostRecentCall.args).toEqual(["Foo", "Bar"]);
        });

        it("properly executes callbacks without a context", function() {
            var spy = jasmine.createSpy();
            chorus.PageEvents.subscribe("foo", spy);

            chorus.PageEvents.broadcast("foo");

            expect(spy).toHaveBeenCalled();
        });
    });
});