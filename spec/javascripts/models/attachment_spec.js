describe("chorus.models.Attachment", function() {
    beforeEach(function() {
        var search = rspecFixtures.searchResultWithAttachmentOnWorkspaceNote();
        this.model = search.attachments().at(0);
        this.model.set({ id: "97", name: "attachmentName" });
    });

    describe("#downloadUrl", function() {
        it("with id of attachment", function() { // because search results are not consistent with "regular" attachments
            this.model.set({id: "123"})
            expect(this.model.downloadUrl()).toBe("/attachments/123/download/");
        });
    });
    describe("#iconUrl", function() {
        it("uses type for the iconUrl", function() {
            this.model.set({type: 'csv'});
            expect(this.model.iconUrl()).toBe(chorus.urlHelpers.fileIconUrl('csv'));
        });

        it("uses fileType for the iconUrl", function() {
            this.model.set({fileType: 'jpg'});
            expect(this.model.iconUrl()).toBe(chorus.urlHelpers.fileIconUrl('jpg'));
        });

        it("uses the IconUrl value if the attachment is image", function() {
            this.model.set({iconUrl: 'note/2/attachments?style=icon'});
            expect(this.model.iconUrl()).toBe('note/2/attachments?style=icon');
        });
    });

    it("returns its name", function() {
        expect(this.model.name()).toBe("attachmentName");
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
            var search = rspecFixtures.searchResultWithAttachmentOnWorkspaceNote();
            this.model = search.attachments().at(0);
        });

        it("returns the correct value", function() {
            this.model.set({type: "IMAGE"});
            expect(this.model.isImage()).toBeTruthy();
            this.model.set({type: "OTHER"});
            expect(this.model.isImage()).toBeFalsy();
        });
    });

    describe("#showUrlTemplate", function() {
        it("shows the URL for a workspace", function() {
            var search = rspecFixtures.searchResultWithAttachmentOnWorkspaceNote();
            var model = search.attachments().at(0);
            var workspace = model.workspace();
            expect(model.showUrl()).toBe("#/workspaces/" + workspace.id);
        });

        it("shows the URL for a dataset with no workspace", function() {
            var search = rspecFixtures.searchResultWithAttachmentOnDatasetNote();
            var model = search.attachments().at(0);
            expect(model.showUrl()).toBe("#/datasets/" + model.dataset().id);
        });

        it("shows the URL for a workfile in a workspace", function() {
            var search = rspecFixtures.searchResultWithAttachmentOnWorkfileNote();
            var model = search.attachments().at(0);
            var workfile = model.workfile();
            var workspace = workfile.workspace();
            expect(model.showUrl()).toBe("#/workspaces/" + workspace.id +
                "/workfiles/" + workfile.id);
        });

        it("shows the URL for an instance", function() {
            var search = rspecFixtures.searchResultWithAttachmentOnInstanceNote();
            var model = search.attachments().at(0);
            var instance = model.instance();
            expect(instance.id).toBeDefined();
            expect(model.showUrl()).toBe(instance.showUrl());
        });

        it("shows the URL for an hdfsFile", function() {
            var search = rspecFixtures.searchResultWithAttachmentOnHdfsNote();
            var model = search.attachments().at(0);
            var hdfs = model.hdfsFile();
            var hadoop = model.hadoopInstance()
            expect(model.showUrl()).toBe("#/hadoop_instances/" + hadoop.id + "/browseFile/" + hdfs.id);
        });
    });

    describe("workspace", function() {
        beforeEach(function() {
            var search = rspecFixtures.searchResultWithAttachmentOnWorkspaceNote();
            this.model = search.attachments().at(0);
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
            var search = rspecFixtures.searchResultWithAttachmentOnWorkfileNote();
            this.model = search.attachments().at(0);
        });

        it("returns the workfile", function() {
            var workfile = this.model.workfile();

            expect(workfile.get('name')).toBe(this.model.get('workfile').name);
            expect(workfile.get('id')).toBe(this.model.get('workfile').id);
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
            var search = rspecFixtures.searchResultWithAttachmentOnHdfsNote();
            this.model = search.attachments().at(0);
        });

        it("returns the hdfsFile", function() {
            this.hdfsFile = this.model.hdfsFile();
            expect(this.hdfsFile.get('name')).toBe(this.model.get('hdfsEntry').name);
            expect(this.hdfsFile.get('id')).toBe(this.model.get('hdfsEntry').id);
        });

        it("returns falsy when there is no hdfsFile", function() {
            this.model.unset('hdfsEntry');
            expect(this.model.hdfsFile()).toBeFalsy();
        });

        it("memoizes", function() {
            expect(this.model.hdfsFile()).toBe(this.model.hdfsFile());
        })
    });

    describe("instance", function() {
        beforeEach(function() {
            var search = rspecFixtures.searchResultWithAttachmentOnInstanceNote();
            this.model = search.attachments().at(0);
        });

        it("returns the instance", function() {
            this.instance = this.model.instance();
            expect(this.instance.get('name')).toBe(this.model.get('instance').name);
            expect(this.instance.get('id')).toBe(this.model.get('instance').id);
        });

        it("dynamically assigns the instance type", function() {
            expect(this.model.instance()).toBeA(chorus.models.GreenplumInstance);
            var search = rspecFixtures.searchResultWithAttachmentOnHadoopNote();
            var model = search.attachments().at(0);
            expect(model.instance()).toBeA(chorus.models.HadoopInstance);
        });

        it("returns falsy when there is no instance", function() {
            this.model.unset('instance');
            expect(this.model.instance()).toBeFalsy();
        });

        it("memoizes", function() {
            expect(this.model.instance()).toBe(this.model.instance());
        })
    });

    describe("dataset", function() {
        beforeEach(function() {
            var search = rspecFixtures.searchResultWithAttachmentOnDatasetNote();
            this.model = search.attachments().at(0);
        });

        it("returns a Database Object", function() {
            this.dataset = this.model.dataset();
            expect(this.dataset).toBeA(chorus.models.Dataset);
            expect(this.dataset.get('objectName')).toBe(this.model.get('dataset').objectName);
            expect(this.dataset.get('id')).toBe(this.model.get('dataset').id);
        });

        it("returns falsy when there is no dataset", function() {
            this.model.unset('dataset');
            expect(this.model.dataset()).toBeFalsy();
        });

        it("memoizes", function() {
            expect(this.model.dataset()).toBe(this.model.dataset());
        });
    });
});