describe("chorus.views.SqlWorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = fixtures.workfile({ fileName: 'test.sql', content: "select * from foo" });
        this.view = new chorus.views.SqlWorkfileContentDetails({ model : this.model })
        spyOn(this.view, 'runInSandbox').andCallThrough();
        this.qtipElement = stubQtip()
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("shows the 'Run File' button", function() {
            expect(this.view.$('button.run_file')).toContainTranslation('workfile.content_details.run_file')
        });

        context("opening the Run File menu", function() {
            beforeEach(function() {
                this.view.$(".run_file").click()
            })

            it("should show 'Run in the workspace sandbox'", function() {
                expect(this.qtipElement).toContainTranslation("workfile.content_details.run_workspace_sandbox")
            })

            context("clicking on 'Run in my workspace'", function() {
                beforeEach(function() {
                    spyOnEvent(this.view, "file:runCurrent");
                    this.qtipElement.find('.run_sandbox').click();
                });

                it("triggers the 'file:runCurrent' event on the view", function() {
                    expect("file:runCurrent").toHaveBeenTriggeredOn(this.view);
                });
            })
        })
    });

});
