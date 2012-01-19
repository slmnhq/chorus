describe("chorus.views.SqlWorkfileContentView", function() {
    beforeEach(function() {
        this.textfile = fixtures.sqlWorkfile({ content: "select * from foos where bar_id = 1;" });
        this.view = new chorus.views.SqlWorkfileContent({model: this.textfile});
    })

    describe("initialization", function() {
        it("has a TextWorkfileContent view", function() {
            expect(this.view.textContent).toBeA(chorus.views.TextWorkfileContent);
        })
    })

    describe("event file:runCurrent", function() {
        beforeEach(function() {
            this.view.model.set({
                content: "select * from foos",
                id: '101'
            });
            this.view.model.sandbox().set({
                instanceId: '2',
                databaseId: '3',
                schemaId: '4'
            });
            this.view.render();
            this.view.textContent.editor.setValue("select * from foos");
            this.view.trigger("file:runCurrent");
        });

        it("creates a task with the right parameters", function() {
            expect(this.view.task.get("sql")).toBe("select * from foos");
            expect(this.view.task.get("instanceId")).toBe("2");
            expect(this.view.task.get("databaseId")).toBe("3");
            expect(this.view.task.get("schemaId")).toBe("4");
            expect(this.view.task.get("entityId")).toBe("101");
        });

        it("saves the task", function() {
            expect(this.server.creates().length).toBe(1);
            expect(this.server.lastCreate().url).toBe(this.view.task.url());
        });

        describe("when the task completes successfully", function() {
            beforeEach(function() {
                this.executionSpy = jasmine.createSpy("execution")
                this.view.bind("file:executionCompleted", this.executionSpy);
                this.server.lastCreate().succeed([]);
            })

            it('triggers file:executionCompleted on the view', function() {
                expect(this.executionSpy).toHaveBeenCalledWith(jasmine.any(chorus.models.Task));
            })
        })
    });
});
