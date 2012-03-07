describe("chorus.dialogs.CreateExternalTableFromHdfs", function() {
    beforeEach(function() {
        setLoggedInUser({id: '54321'});
        chorus.page = {};
        this.sandbox = fixtures.sandbox({
            schemaName: "mySchema",
            databaseName: "myDatabase",
            instanceName: "myInstance"
        })
        chorus.page.workspace = fixtures.workspace();
        this.csv = fixtures.csvImport({lines: [
            "COL1,col2, col3 ,col 4,Col_5",
            "val1.1,val1.2,val1.3,val1.4,val1.5",
            "val2.1,val2.2,val2.3,val2.4,val2.5",
            "val3.1,val3.2,val3.3,val3.4,val3.5"
        ],
            toTable: "foo_quux_bar"
        });
        this.dialog = new chorus.dialogs.CreateExternalTableFromHdfs({csv: this.csv});
        this.dialog.render();
    });

    it("has the right labels", function() {
        expect(this.dialog.title).toMatchTranslation("hdfs.create_external.title");
        expect(this.dialog.$("button.submit").text()).toMatchTranslation("hdfs.create_external.ok");
    })

    it("fetches the list of workspaces for the logged in user", function() {
        var workspaces = new chorus.collections.WorkspaceSet([], {userId: "54321"});
        expect(workspaces).toHaveBeenFetched();
    })

    context("when the workspace fetch completes and there are no workspaces", function() {
        beforeEach(function() {
            this.server.completeFetchAllFor(new chorus.collections.WorkspaceSet([], {userId: "54321"}));
        });

        it("populates the dialog's errors div", function() {
            expect(this.dialog.$(".errors")).toContainTranslation("hdfs.create_external.no_workspaces");
        })
    })

    context("when the workspace fetch completes and there are workspaces", function() {
        beforeEach(function() {
            spyOn(chorus, "styleSelect")
            this.workspace1 = fixtures.workspace();
            this.workspace2 = fixtures.workspace();
            this.server.completeFetchAllFor(new chorus.collections.WorkspaceSet([], {userId: "54321"}), [this.workspace1, this.workspace2]);
        });

        it("has a select with the workspaces as options", function() {
            expect(this.dialog.$(".directions option").length).toBe(2);
            expect(this.dialog.$(".directions option").eq(0).text()).toBe(this.workspace1.get("name"));
            expect(this.dialog.$(".directions option").eq(1).text()).toBe(this.workspace2.get("name"));

            expect(this.dialog.$(".directions option").eq(0).val()).toBe(this.workspace1.id);
            expect(this.dialog.$(".directions option").eq(1).val()).toBe(this.workspace2.id);
        })

        it("styles the select", function() {
            expect(chorus.styleSelect).toHaveBeenCalled();
        })
    })
});