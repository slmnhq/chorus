describe("chorus.Mixins.EventRelay", function(){
    beforeEach(function(){
        this.relayObj = {};
        this.source = {};
        this.target = {};

        _.extend(this.relayObj, Backbone.Events, chorus.Mixins.EventRelay);
        _.extend(this.source, Backbone.Events, chorus.Mixins.EventRelay);
        _.extend(this.target, Backbone.Events, chorus.Mixins.EventRelay);

        this.relayObj.relay(this.source, this.target, "my_event");
    });

    it("triggers the event on the target, when the source is triggered", function(){
        var spy = jasmine.createSpy("relay spy");
        this.target.bind("my_event", spy);
        this.source.trigger("my_event");

        expect(spy).toHaveBeenCalled();
    });

    it("triggers the event on the target, when the source is triggered, retaining arguments", function(){
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