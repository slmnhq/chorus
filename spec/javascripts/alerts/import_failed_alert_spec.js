describe("chorus.alerts.ImportFailed", function() {
    beforeEach(function() {
        this.launchElement = $("<a/>");
        this.launchElement.attr("data-task-id", "123");
        this.alert = new chorus.alerts.ImportFailed({ launchElement: this.launchElement });
    });

    describe("initialization", function() {
        it("should have the correct title", function() {
            expect(this.alert.title).toMatchTranslation("import.failed.alert.title");
        });

        it("fetches the task with the given id", function() {
            var task = new chorus.models.TaskReport({id: "123"});
            expect(task).toHaveBeenFetched();
        });

        it("declares the task as a required resource", function() {
            expect(this.alert.requiredResources.length).toBe(1);
            expect(this.alert.requiredResources.at(0)).toBeA(chorus.models.TaskReport);
            expect(this.alert.requiredResources.at(0).id).toBe(123);
        });

        describe("when the task is fetched", function() {
            beforeEach(function() {
                this.server.lastFetch().succeed(new chorus.models.TaskReport({
                    result: "this failed",
                    state: "failed"
                }));
            });

            it("renders the error details", function() {
                expect(this.alert.$(".body p")).toHaveText("this failed");
            });
        });
    });
});
