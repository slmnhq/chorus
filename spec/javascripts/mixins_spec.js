describe("chorus.Mixins.Events", function(){
    beforeEach(function(){
        this.source = {};
        this.target = {};

        _.extend(this.source, Backbone.Events, chorus.Mixins.Events);
        _.extend(this.target, Backbone.Events, chorus.Mixins.Events);

        this.source.forwardEvent("my_event", this.target);
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