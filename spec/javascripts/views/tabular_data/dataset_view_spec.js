describe("chorus.views.Dataset", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetSourceTable({
            objectName: "john_the_table",
            workspaceUsed: {
                count: 5,
                workspaceList: [
                    { id: '1', name: "Hoge" },
                    { id: '2', name: "Fuga" },
                    { id: '3', name: "Piyo" },
                ]
            }
        });
        this.qtipSpy = stubQtip();
        this.view = new chorus.views.Dataset({ model: this.dataset, activeWorkspace: true });
        this.view.render();
    });

    it("renders breadcrumbs for the table's instance, database and schema", function() {
        expect(this.view.$(".instance")).toContainText(this.dataset.instance().get("name"));
        expect(this.view.$(".database")).toContainText(this.dataset.schema().database().get("name"));
        expect(this.view.$(".schema")).toContainText(this.dataset.schema().get("name"));
    });

    it("attaches the instance model to the instance and database breadcrumbs", function() {
        expect(this.view.$(".instance").data("instance")).toBe(this.dataset.get("instance"));
        expect(this.view.$(".database").data("instance")).toBe(this.dataset.get("instance"));
    });

    describe("found in workspaces tooltip", function() {
        it("is rendered", function() {
            expect(this.view.$(".found_in")).toContainText("Hoge");
        });

        it("qtip-ifies the other_menu", function() {
            expect(this.qtipSpy).not.toHaveVisibleQtip();
            this.view.$('.found_in .open_other_menu').click()
            expect(this.qtipSpy).toHaveVisibleQtip();
            expect(this.qtipSpy.find('li').length).toBe(2);
        })

        context("when the dataset is not used in any workspace", function() {
            beforeEach(function() {
                this.dataset.unset("workspaceUsed");
                this.view.render();
            });

            it("renders successfully without the workspace usage section", function() {
                expect(this.view.$(".found_in")).not.toExist();
            });
        });
    })

    describe("when the workspace is archived", function() {
        beforeEach(function() {
            this.view.options.activeWorkspace = false;
            this.view.render();
        });

        it("does not have dataset links (still has instance links)", function() {
            expect(this.view.$("a.image")).not.toExist();
            expect(this.view.$("a.name")).not.toExist();
        });
    });

    context("when the user has credentials to view the dataset", function() {
        itRendersTheNameAndIcon();

        it("links the dataset name and icon to its show page", function() {
            expect(this.view.$(".name")).toHaveHref(this.dataset.showUrl());
            expect(this.view.$(".image")).toHaveHref(this.dataset.showUrl());
        });
    });

    context("when the user does not have credentials to view the dataset", function() {
        beforeEach(function() {
            this.dataset.set({hasCredentials: false});
        });

        it("adds the 'no_credentials' class to the element", function() {
            expect($(this.view.el)).toHaveClass("no_credentials");
        });

        itRendersTheNameAndIcon();

        it("does not link the dataset name or icon to its show page", function() {
            expect(this.view.$(".name")).toBe("span");
            expect(this.view.$(".image")).toBe("span");
        });
    });

    context("when the dataset has a comment", function() {
        beforeEach(function() {
            this.dataset.set({ recentComment: {
                text: "I love you john.",
                author: {
                    id: "1",
                    lastName: "Smith",
                    firstName: "Bob"
                },
                timestamp: "2011-12-15 12:34:56"
            }});
        });

        it("renders the most recent comment", function() {
            expect(this.view.$(".comment .body")).toContainText("I love you john.");
            expect(this.view.$(".comment a")).toContainText("Bob Smith");
            expect(this.view.$(".comment_info .on")).toContainText("Dec 15");
        });
    });

    context("when there are no comments", function() {
        beforeEach(function() {
            this.dataset.unset("recentComment");
        });

        it("does not display the most recent comment", function() {
            expect(this.view.$(".comment")).not.toExist();
        });
    });

    context("when the model has an import schedule", function() {
        beforeEach(function() {
            this.dataset.set({ importFrequency: "WEEKLY"});
        });

        it("displays the correct import tag", function() {
            expect(this.view.$(".tag .tag_name").text()).toContainTranslation("import.frequency.weekly");
        });
    })

    context("when the model does not have an import schedule", function() {
        beforeEach(function() {
            this.dataset.unset("importFrequency");
        });

        it("does not display the import tag", function() {
            expect(this.view.$(".tag")).not.toExist();
        });
    });

    it("works with database objects as well as datasets", function() {
        var table = fixtures.databaseTable({objectName: 'yyy'});
        table.get("workspaceUsed").workspaceCount = 3;
        table.get("workspaceUsed").workspaceList = [fixtures.nestedWorkspaceJson(), fixtures.nestedWorkspaceJson(), fixtures.nestedWorkspaceJson()];
        var view = new chorus.views.Dataset({ model: table });
        view.render();
    });

    function itRendersTheNameAndIcon() {
        it("renders the dataset's name", function() {
            expect(this.view.$(".name")).toContainText("john_the_table");
        });

        it("renders an icon for the dataset", function() {
            expect(this.view.$("img")).toHaveAttr("src", this.dataset.iconUrl());
            expect(this.view.$("img")).toHaveAttr("title", Handlebars.helpers.humanizedTabularDataType(this.dataset.attributes));
        });
    }
});
