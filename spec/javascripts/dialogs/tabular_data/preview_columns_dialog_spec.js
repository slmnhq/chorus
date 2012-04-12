describe("chorus.dialogs.PreviewColumns", function() {
    beforeEach(function() {
        stubModals();
        spyOn(chorus, "search");
        this.databaseObject = newFixtures.datasetSourceTable();
        this.dialog = new chorus.dialogs.PreviewColumns({model: this.databaseObject});
        this.dialog.render();
    });

    it("should have a title", function() {
        expect(this.dialog.title).toMatchTranslation("dataset.manage_join_tables.title");
    });

    it("fetches the table or view's columns", function() {
        expect(this.databaseObject.columns()).toHaveBeenFetched();
    });

    describe("when the fetch completes successfully", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.databaseObject.columns(), [
                fixtures.databaseColumn({name: "Rhino", recentComment: "awesome", type: "text" }),
                fixtures.databaseColumn({name: "Giraffe", recentComment: "tall", type: "float8" }),
                fixtures.databaseColumn({name: "Sloth", recentComment: "lazy", type: "int4" }),
                fixtures.databaseColumn({name: "Penguin", recentComment: "Morgan Freeman", type: "time" })
            ]);
        });

        it("should have a 'Return to List' button", function() {
            expect(this.dialog.$("button.cancel").html()).toMatchTranslation("actions.return_to_list");
        });

        it("displays a search bar", function() {
            var search = this.dialog.$("input.search");
            expect(search).toExist();

            expect(chorus.search).toHaveBeenCalled();
            var searchOptions = chorus.search.mostRecentCall.args[0];
            expect(searchOptions.input).toBe(".search");
            expect(searchOptions.list).toBe("ul.list");
            expect(searchOptions.selector).toBe(".name, .comment");

            expect(search.attr("placeholder")).toMatchTranslation("dataset.manage_join_tables.find_a_column");
        });

        it("displays the table's name and column count in the sub-header", function() {
            expect(this.dialog.$(".sub_header .name").text()).toBe(this.databaseObject.get("objectName"));
            expect(this.dialog.$(".sub_header .column_count").text()).toBe("(4)");
        });

        it("displays a li for each column fetched", function() {
            expect(this.dialog.$("li").length).toBe(4);
        });

        describe("the column list", function() {
            it("should display the name of each column", function() {
                var names = this.dialog.$("li .name");
                expect(names.eq(0).text()).toBe("Rhino");
                expect(names.eq(1).text()).toBe("Giraffe");
                expect(names.eq(2).text()).toBe("Sloth");
                expect(names.eq(3).text()).toBe("Penguin");
            });

            it("should display the comment of each column", function() {
                var comments = this.dialog.$("li .comment");
                expect(comments.eq(0).text()).toBe("awesome");
                expect(comments.eq(1).text()).toBe("tall");
                expect(comments.eq(2).text()).toBe("lazy");
                expect(comments.eq(3).text()).toBe("Morgan Freeman");
            });

            it("should display the column type ribbon for each column", function() {
                var types = this.dialog.$("li .type");
                expect(types.eq(0).text()).toBe("text");
                expect(types.eq(1).text()).toBe("float8");
                expect(types.eq(2).text()).toBe("int4");
                expect(types.eq(3).text()).toBe("time");
            });
        });
    });

    describe("when the fetch fails", function() {
        beforeEach(function() {
            spyOn(this.dialog, "closeModal");
            this.dialog.previousModal = {
                showErrors: jasmine.createSpy("showErrors")
            }
            this.server.lastFetch().fail();
        });

        it("copies the serverErrors to the dialog model", function() {
            expect(this.dialog.model.serverErrors).toEqual(this.databaseObject.columns().serverErrors)
        });

        it("closes itself", function() {
            expect(this.dialog.closeModal).toHaveBeenCalled();
        });

        it("shows errors on the previous modal", function() {
            expect(this.dialog.previousModal.showErrors).toHaveBeenCalledWith(this.dialog.model);
        });
    });
});
