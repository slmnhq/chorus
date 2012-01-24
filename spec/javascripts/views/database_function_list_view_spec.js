describe("chorus.views.DatabaseFunctionList", function() {
    beforeEach(function() {
        this.sandbox = fixtures.sandbox();
        this.schema = this.sandbox.schema();
        spyOn(this.schema.functions(), "fetch").andCallThrough();
        this.view = new chorus.views.DatabaseFunctionList({sandbox: this.sandbox});
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
                expect(this.view.$('ul')).toExist();
                expect(this.view.$('ul li').length).toBe(2);
            });

            it("should display the current schema name", function() {
                expect(this.view.$('.schema_name')).toContainText(this.sandbox.get('schemaName'));
            })

            it("should not show the 'no functions found' text", function() {
                expect(this.view.$('.none_found')).not.toExist();
            });
        });

        context("when the schema has no functions", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.view.functions, []);
            });

            it("should show the 'no functions found' text", function() {
                expect(this.view.$('.none_found')).toContainTranslation("schema.functions.none_found");
            });
        });
    })
});
