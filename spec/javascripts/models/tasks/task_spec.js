describe("chorus.models.Task", function() {
    var TaskSubclass, task;

    beforeEach(function() {
        TaskSubclass = chorus.models.Task.extend({
            urlTemplateBase: "base"
        });

        task = new TaskSubclass();
    });

    describe("#url", function() {
        context("for delete requests", function() {
            it("appends the task's 'checkId' to the 'urlTemplateBase'", function() {
                task.set({ checkId: "123_4" });
                task.cancel();
                expect(this.server.lastDestroy().url).toBe("/base/123_4");
            });
        });

        context("for creates, updates and reads", function() {
            it("uses the 'urlTemplateBase'", function() {
                task.set({ checkId: "123_4" });
                task.save();
                var request = this.server.lastCreate();
                expect(request.url).toBe("/base");
                expect(request.params()["task[check_id]"]).toBe("123_4");
            });
        });
    });

    it("has a random checkId", function() {
        spyOn(Math, 'random').andReturn(42);
        task = new TaskSubclass();
        expect(task.get("checkId")).toBe('42_' + chorus.session.user().id);
    });

    describe("cancel", function() {
        beforeEach(function() {
            task = new TaskSubclass();
            task.cancel();
        });

        itCreatesCancelRequestAndIgnoreSubsequent();

        describe("when the request completes", function() {
            beforeEach(function() {
                spyOnEvent(task, 'canceled');
                this.server.lastDestroy().succeed();
                this.server.reset();
            });

            it("triggers the 'canceled' event on the task", function() {
                expect('canceled').toHaveBeenTriggeredOn(task);
            });

            context("click on cancel again", function() {
                beforeEach(function() {
                    task.cancel();
                });

                itCreatesCancelRequestAndIgnoreSubsequent();
            })
        });

        function itCreatesCancelRequestAndIgnoreSubsequent() {
            it("creates a cancel request", function() {
                var cancelRequest = this.server.lastDestroy();
                expect(cancelRequest.url).toMatchUrl(task.url({ method: "delete" }));
                expect(task.has('action')).toBeFalsy();
            });

            it("ignores subsequent calls to cancel", function() {
                task.cancel();
                expect(this.server.requests.length).toBe(1);
            });
        }
    });

    it("won't cancel after the data has loaded", function() {
        task = new TaskSubclass();
        task.loaded = true;
        task.cancel();
        expect(this.server.requests.length).toBe(0);
    });
});
