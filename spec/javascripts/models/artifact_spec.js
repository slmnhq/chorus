describe("chorus.models.Artifact", function() {
    beforeEach(function() {
        this.model = fixtures.artifact({ id: "97" });
    });

    it("has the appropriate #downloadUrl", function() {
        expect(this.model.downloadUrl()).toBe("/edc/file/97");
    });

    it("uses type for the iconUrl", function() {
        this.model.set({type: 'csv'});
        expect(this.model.iconUrl()).toBe(chorus.urlHelpers.fileIconUrl('csv'));
    });

    it("uses fileType for the iconUrl", function() {
        this.model.set({fileType: 'jpg'});
        expect(this.model.iconUrl()).toBe(chorus.urlHelpers.fileIconUrl('jpg'));
    });

    describe("workspace", function() {
        beforeEach(function() {
            this.model = fixtures.attachmentOnDatasetInWorkspaceSearchResult();
        });

        it("returns the workspace", function() {
            this.workspace = this.model.workspace();
            expect(this.workspace.get('name')).toBe(this.model.get('workspace').name);
            expect(this.workspace.get('id')).toBe(this.model.get('workspace').id);
        });

        it("returns falsy when there is no workspace", function() {
            this.model.unset('workspace');
            expect(this.model.workspace()).toBeFalsy();
        });

        it("returns falsy when workspace is empty", function() {
            this.model.set({workspace: {}});
            expect(this.model.workspace()).toBeFalsy();
        });

        it("memoizes", function() {
            expect(this.model.workspace()).toBe(this.model.workspace());
        })
    });

    describe("tabularData", function() {
        context("when there is a workspace", function() {
            beforeEach(function() {
                this.model = fixtures.attachmentOnDatasetInWorkspaceSearchResult();
            });

            it("returns a dataset", function() {
                this.tabularData = this.model.tabularData();
                expect(this.tabularData).toBeA(chorus.models.Dataset);
                expect(this.tabularData.get("workspace")).toBe(this.model.get('workspace'));
                expect(this.tabularData.get('objectName')).toBe(this.model.get('databaseObject').objectName);
                expect(this.tabularData.get('id')).toBe(this.model.get('databaseObject').id);
            });

            it("returns falsy when there is no databaseObject", function() {
                this.model.unset('databaseObject');
                expect(this.model.tabularData()).toBeFalsy();
            });

            it("memoizes", function() {
                expect(this.model.tabularData()).toBe(this.model.tabularData());
            })
        });

        context("when there is no workspace", function() {
            beforeEach(function() {
                this.model = fixtures.attachmentOnDatasetNotInWorkspaceSearchResult();
            });

            it("returns a Database Object", function() {
                this.tabularData = this.model.tabularData();
                expect(this.tabularData).toBeA(chorus.models.DatabaseObject);
                expect(this.tabularData.get('objectName')).toBe(this.model.get('databaseObject').objectName);
                expect(this.tabularData.get('id')).toBe(this.model.get('databaseObject').id);
            });

            it("returns falsy when there is no databaseObject", function() {
                this.model.unset('databaseObject');
                expect(this.model.tabularData()).toBeFalsy();
            });

            it("memoizes", function() {
                expect(this.model.tabularData()).toBe(this.model.tabularData());
            })
        });
    });
});