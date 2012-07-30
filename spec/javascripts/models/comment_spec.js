describe("chorus.models.Comment", function() {
    beforeEach(function() {
        this.model = fixtures.noteComment({
            id: '41',
            author: {
                id: "45",
                firstName: "LeBron",
                lastName: "James"
            }
        });
    });

    describe("#urlTemplate", function() {
        it("correctly encodes the url", function() {
            this.model.set({entityType: "foo", entityId: "a/b/c"});
            expect(this.model.url()).toContain("/comment/foo/a%2Fb%2Fc/41");
        });

        it("correctly encodes the url of new comments", function() {
            this.model.set({id: null, entityType: "foo", entityId: "%bar"});
            expect(this.model.url()).toContain("/comment/foo/%25bar");
        });

        it("has the right url if it is a file", function() {
            this.model.set({entityType: "foo", entityId: "a/b/c"});
            expect(this.model.url({isFile: true})).toContain("/comment/foo/a%2Fb%2Fc/41/file");
        });
    });

    describe("validation", function() {
        it("should return a falsyy value if there is no body", function() {
            this.model.set({ body: "" });
            expect(this.model.performValidation()).toBeFalsy();
        });
        it("should return a truthy value if there is a body", function() {
            this.model.set({ body: "foo" });
            expect(this.model.performValidation()).toBeTruthy();
        });
    });

    describe("#note", function() {
        it("should return true for a note", function() {
            this.model.set({type: "NOTE"});
            expect(this.model.note()).toBeTruthy();
        });

        it("should return false for everything else", function() {
            this.model.set({type: "SUB_COMMENT"});
            expect(this.model.note()).toBeFalsy();
        });

        it("should return false when undefined", function() {
            this.model.unset("type");
            expect(this.model.note()).toBeFalsy();
        });
    });

    describe("#author", function() {
        beforeEach(function() {
            this.author = this.model.author();
        });

        it("returns a user with the right name", function() {
            expect(this.author.get("firstName")).toBe("LeBron");
            expect(this.author.get("lastName")).toBe("James");
        });

        it("memoizes", function() {
            expect(this.author).toBe(this.model.author());
        });
    });

    describe("saving the workfile attachments", function() {
        it("assigns the 'workfileIds' field as a comma-separated list of workfile ids", function() {
            this.model.workfiles = new chorus.collections.WorkfileSet([
                new chorus.models.Workfile({ id: 44 }),
                new chorus.models.Workfile({ id: 45 }),
                new chorus.models.Workfile({ id: 46 })
            ]);

            this.model.save();

            expect(this.model.get("workfileIds")).toBe("44,45,46");
        });
    });

    describe("saving the dataset attachments", function() {
        it("assigns the 'datasetIds' field as a comma-separated list of dataset ids", function() {
            this.model.datasets = new chorus.collections.WorkspaceDatasetSet([
                newFixtures.workspaceDataset.sandboxTable({ objectName: "table_a", id: 'a'}),
                newFixtures.workspaceDataset.sandboxTable({ objectName: "table_b", id: 'b'}),
                newFixtures.workspaceDataset.sandboxTable({ objectName: "table_c", id: 'c'})
            ]);

            this.model.save();

            expect(this.model.get("datasetIds")).toBe("a,b,c");
        });
    });

    function createSubmitSpy() {
        var fakePromise = jasmine.createSpyObj('submitResult', ['done', 'fail']);
        fakePromise.done.andReturn(fakePromise);
        fakePromise.fail.andReturn(fakePromise);

        var spy = jasmine.createSpy('submit').andReturn(fakePromise);
        spy.promise = fakePromise;
        return spy;
    }
});
