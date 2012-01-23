describe("chorus.views.SchemaFunctions", function() {
    beforeEach(function() {
        this.sandbox = fixtures.sandbox();
        this.schema = this.sandbox.schema();
        spyOn(this.schema.functions(), "fetch").andCallThrough();
        this.view = new chorus.views.SchemaFunctions({sandbox: this.sandbox});
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

            it("should display the current schema name", function() {
                expect(this.view.$('.schema_name')).toContainText(this.sandbox.get('schemaName'));
            })

            it("should not show the 'no functions found' text", function() {
                expect(this.view.$('.none_found')).not.toExist();
            });

            it("should not show the 'insert arrows'", function() {
                expect(this.view.$('.functions .insert_hover')).toHaveClass("hidden")
            })

            context("when hovering over a function li", function() {
                beforeEach(function() {
                   this.view.$('.functions li:eq(1)').mouseenter();
                });

                it("shows the insert arrow", function() {
                    expect(this.view.$('.functions .insert_hover:eq(1)')).not.toHaveClass('hidden');
                    expect(this.view.$('.functions .insert_hover:eq(0)')).toHaveClass('hidden');
                })

                it("has the insert text", function() {
                    expect(this.view.$('.functions .insert_link:eq(1)').text()).toMatchTranslation('schema.functions.insert')
                })

                context("when leaving the function li", function() {
                    beforeEach(function() {
                      this.view.$('.functions li:eq(1)').mouseleave();
                    })

                    it("should not show the insert arrow", function() {
                      expect(this.view.$('.functions .insert_hover:eq(1)')).toHaveClass('hidden');
                      expect(this.view.$('.functions .insert_hover:eq(0)')).toHaveClass('hidden');
                    })
                })
            })
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
