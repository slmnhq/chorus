describe("chorus.views.SchemaFunctions", function() {
    beforeEach(function() {
        this.sandbox = fixtures.sandbox();
        this.schema = this.sandbox.schema();
        spyOn(this.schema.functions(), "fetch").andCallThrough();
        this.view = new chorus.views.SchemaFunctions(this.sandbox);
    });

    it("should fetch the functions for the sandbox", function() {
        expect(this.schema.functions().fetch).toHaveBeenCalled();
    });

    it("should set the functionSet as the resource", function() {
        expect(this.view.resource).toBe(this.schema.functions());
    })

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
            $('#jasmine_content').append(this.view.el);
        });

        it("should show the loading section", function() {
            expect(this.view.$('.loading_section')).toExist();
        });

        context("after functions have loaded", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.view.functions, [fixtures.schemaFunction(), fixtures.schemaFunction()]);
            });

            it("should not show the loading section", function() {
                expect(this.view.$('.loading_section')).not.toExist();
            });

            it("should render the functions", function() {
                expect(this.view.$('ul.functions')).toExist();
                expect(this.view.$('ul.functions li').length).toBe(2);
            });
        });
    })
});