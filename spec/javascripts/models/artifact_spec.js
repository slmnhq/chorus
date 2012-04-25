describe("chorus.models.Artifact", function() {
    beforeEach(function() {
        this.model = fixtures.artifact({ id: "97", name: "helmut" });
    });

    describe("#downloadUrl", function() {
        it("prefers fileId over id", function() { // because search results are not consistent with "regular" attachments
            this.model.set({fileId: "123"})
            expect(this.model.downloadUrl()).toBe("/file/123");
        });

        it("uses id when fileId is not present", function() {
            expect(this.model.downloadUrl()).toBe("/file/97");
        });
    });

    it("uses type for the iconUrl", function() {
        this.model.set({type: 'csv'});
        expect(this.model.iconUrl()).toBe(chorus.urlHelpers.fileIconUrl('csv'));
    });

    it("uses fileType for the iconUrl", function() {
        this.model.set({fileType: 'jpg'});
        expect(this.model.iconUrl()).toBe(chorus.urlHelpers.fileIconUrl('jpg'));
    });

    it("returns its name", function () {
        expect(this.model.name()).toBe("helmut");
    });

    describe("#thumbnailUrl", function() {
        it("prefers fileId over id", function() { // because search results are not consistent with "regular" attachments
            this.model.set({fileId: "123"})
            expect(this.model.thumbnailUrl()).toBe("/file/123/thumbnail");
        });

        it("uses id when fileId is not present", function() {
            expect(this.model.thumbnailUrl()).toBe("/file/97/thumbnail");
        });
    });

    describe("#isImage", function() {
        beforeEach(function() {
            this.image = fixtures.artifact({ type: "IMAGE" });
            this.noImage = fixtures.artifact({ type: "OTHER" });
        });

        it("returns the correct value", function() {
            expect(this.image.isImage()).toBeTruthy();
            expect(this.noImage.isImage()).toBeFalsy();
        });
    });

    describe("#showUrlTemplate", function() {
        it("shows the URL for a workspace", function() {
            var model = fixtures.attachmentOnWorkspaceSearchResult();
            expect(model.showUrl()).toBe("#/workspaces/10000");
        });

        it("shows the URL for a tabularData set in a workspace", function() {
            var model = fixtures.attachmentOnDatasetInWorkspaceSearchResult();
            var encoded_id = encodeURIComponent('"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"2010_report_on_white_house"');
            expect(model.showUrl()).toBe("#/workspaces/33333/datasets/" + encoded_id);
        });

        it("shows the URL for a tabularData with no workspace", function() {
            var model = fixtures.attachmentOnDatasetNotInWorkspaceSearchResult();
            expect(model.showUrl()).toBe("#/instances/22222/databases/dca_demo/schemas/ddemo/BASE_TABLE/2010_report_on_white_house");
        });

        it("shows the URL for a workfile in a workspace", function() {
            var model = fixtures.attachmentOnWorkfileInWorkspaceSearchResult();
            expect(model.showUrl()).toBe("#/workspaces/10000/workfiles/10030");
        });

        it("shows the URL for an instance", function() {
             var model = fixtures.attachmentOnInstanceSearchResult();
             expect(model.showUrl()).toBe("#/instances/10000/databases");
         });

        it("shows the URL for an hdfsFile", function() {
            var model = fixtures.attachmentOnFileInHdfsSearchResult();
            expect(model.showUrl()).toBe("#/instances/10020/browseFile/data/cleardb.sql");
        });
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

    describe("workfile", function() {
        beforeEach(function() {
            this.model = fixtures.attachmentOnWorkfileInWorkspaceSearchResult();
        });

        it("returns the workfile", function() {
            this.workfile = this.model.workfile();
            expect(this.workfile.get('name')).toBe(this.model.get('workfile').name);
            expect(this.workfile.get('id')).toBe(this.model.get('workfile').id);
        });

        it("returns falsy when there is no workfile", function() {
            this.model.unset('workfile');
            expect(this.model.workfile()).toBeFalsy();
        });

        it("memoizes", function() {
            expect(this.model.workfile()).toBe(this.model.workfile());
        })
    });

    describe("hdfs", function() {
        beforeEach(function() {
            this.model = fixtures.attachmentOnFileInHdfsSearchResult();
        });

        it("returns the hdfsFile", function() {
            this.hdfsFile = this.model.hdfsFile();
            expect(this.hdfsFile.get('name')).toBe(this.model.get('hdfs').name);
            expect(this.hdfsFile.get('id')).toBe(this.model.get('hdfs').id);
        });

        it("returns falsy when there is no hdfsFile", function() {
            this.model.unset('hdfs');
            expect(this.model.hdfsFile()).toBeFalsy();
        });

        it("memoizes", function() {
            expect(this.model.hdfsFile()).toBe(this.model.hdfsFile());
        })
    });

    describe("instance", function() {
        beforeEach(function() {
            this.model = fixtures.attachmentOnInstanceSearchResult();
        });

        it("returns the instance", function() {
            this.instance = this.model.instance();
            expect(this.instance.get('name')).toBe(this.model.get('instance').name);
            expect(this.instance.get('id')).toBe(this.model.get('instance').id);
        });

        it("returns falsy when there is no instance", function() {
            this.model.unset('instance');
            expect(this.model.instance()).toBeFalsy();
        });

        it("memoizes", function() {
            expect(this.model.instance()).toBe(this.model.instance());
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