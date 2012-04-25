describe("chorus.models.Task", function() {
    var taskSubclass = chorus.models.Task.extend({});
    taskSubclass.prototype.taskType = "foo";
    beforeEach(function() {
        this.model = new taskSubclass();
    });

    it("has the right url", function() {
        var expectedUrl = "/task/sync/";
        expect(this.model.url()).toMatchUrl(expectedUrl);
    });

    it("sets the 'taskType' attribute based on the prototype's property", function(){
       expect(this.model.get("taskType")).toBe("foo");
    });

    it("has a random checkId", function() {
        spyOn(Math, 'random').andReturn(42);
        this.model = new taskSubclass();
        expect(this.model.get("checkId")).toBe('42');
    });

    describe("cancel", function() {
        beforeEach(function() {
            this.model = new taskSubclass();
            this.model.cancel();
        });

        itCreatesCancelRequestAndIgnoreSubsequent();

        describe("when the request completes", function() {
            beforeEach(function() {
                spyOnEvent(this.model, 'canceled');
                this.server.lastUpdate().succeed();
                this.server.reset();

            });
            it("triggers the 'canceled' event on the task", function() {
                expect('canceled').toHaveBeenTriggeredOn(this.model);
            });
            it("reset cancelled flag", function() {
                expect(this.model.cancelled).toBeFalsy();
            })

            context("click on cancel again", function() {
                beforeEach(function() {
                    this.model.cancel();
                });

                itCreatesCancelRequestAndIgnoreSubsequent();
            })
        });

        function itCreatesCancelRequestAndIgnoreSubsequent() {
            it("creates a cancel request", function() {
                var cancelRequest = this.server.lastUpdate();
                expect(cancelRequest.url).toMatchUrl(this.model.url());
                expect(cancelRequest.params()['taskType']).toBe(this.model.get('taskType'));
                expect(cancelRequest.params()['checkId']).toBe(this.model.get('checkId'));
                expect(cancelRequest.params()['action']).toBe('cancel');
                expect(this.model.has('action')).toBeFalsy();
            });

            it("ignores subsequent calls to cancel", function() {
                this.model.cancel();
                expect(this.server.requests.length).toBe(1);
            });
        }
    });

    it("won't cancel after the data has loaded", function() {
        this.model = new taskSubclass();
        this.model.loaded = true;
        this.model.cancel();
        expect(this.server.requests.length).toBe(0);
    });
});
