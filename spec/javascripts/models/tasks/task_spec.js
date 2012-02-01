describe("chorus.models.Task", function() {
    beforeEach(function() {
        var taskSubclass = chorus.models.Task.extend({});
        taskSubclass.prototype.taskType = "foo";
        this.model = new taskSubclass;
    });

    it("has the right url", function() {
        var expectedUrl = "/edc/task/sync/";
        expect(this.model.url()).toMatchUrl(expectedUrl);
    });

    it("sets the 'taskType' attribute based on the prototype's property", function(){
       expect(this.model.get("taskType")).toBe("foo");
    });
});
