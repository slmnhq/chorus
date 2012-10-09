describe("chorus.views.SearchAttachment", function() {
    beforeEach(function() {
        var search = rspecFixtures.searchResultWithAttachmentOnWorkspaceNote();
        this.result = search.attachments().at(0);
        this.view = new chorus.views.SearchAttachment({model: this.result});
        this.view.render()
    });

    it("shows the thumbnail for an image", function() {
        expect(this.view.$("img.icon").attr("src")).toBe(this.result.iconUrl());
    });

    it("shows the iconUrl for a non-image", function() {
        this.result.set({fileType: "OTHER"})
        expect(this.view.$("img.icon").attr("src")).toBe(this.result.iconUrl());
    });

    it("has a link to the download for the attachment", function() {
        expect(this.view.$('a.name').attr('href')).toBe(this.result.downloadUrl());
    });

    context("with tabular data", function() {
        beforeEach(function() {
            var search = rspecFixtures.searchResultWithAttachmentOnDatasetNote();
            this.result = search.attachments().at(0);
            this.view = new chorus.views.SearchAttachment({model: this.result});
            this.view.render();
        });

        it("shows the tabular data set", function() {
            expect(
                this.view.$(".description .found_in").html()).toContainTranslation(
                "attachment.found_in.dataset_not_in_workspace",
                {
                    datasetLink: '<a href="#/datasets/' + this.result.dataset().id  + '">searchquery_table</a>'
                }
            );
        });
    });

    context("with workfile in a workspace", function() {
        beforeEach(function() {
            var search = rspecFixtures.searchResultWithAttachmentOnWorkfileNote();
            this.result = search.attachments().at(0);
            this.view = new chorus.views.SearchAttachment({model: this.result});
            this.view.render();
        });

        it("shows the workfile set", function() {
            var workfile = this.result.workfile();
            var workspace = workfile.workspace();

            var workspaceUrl = "#/workspaces/"+workspace.id;
            var workfileUrl = workspaceUrl+ "/workfiles/"+workfile.id;

            expect(
                this.view.$(".description .found_in").html()).toContainTranslation(
                "attachment.found_in.workfile_in_workspace",
                {
                    workfileLink: '<a href="'+workfileUrl+'">'+workfile.name()+'</a>',
                    workspaceLink: '<a href="'+workspaceUrl+'">'+workspace.name()+'</a>'
                }
            );
        });
    });

    context("with file in a hdfs", function() {
        beforeEach(function() {
            var search = rspecFixtures.searchResultWithAttachmentOnHdfsNote();
            this.result = search.attachments().at(0);
            this.view = new chorus.views.SearchAttachment({model: this.result});
            this.view.render();
        });

        it("shows the file", function() {
            var hdfs = this.result.hdfsFile();
            var hadoop_instance = this.result.hadoopInstance();
            expect(
                this.view.$(".description .found_in").html()).toContainTranslation(
                "attachment.found_in.file_in_hdfs",
                {
                    hdfsFileLink: '<a href="#/hadoop_instances/' + hadoop_instance.id +  '/browseFile/' + hdfs.id  +'">'+hdfs.name()+'</a>'
                }
            );
        });
    });

    context("with workspace", function() {
        beforeEach(function() {
            var search = rspecFixtures.searchResultWithAttachmentOnWorkspaceNote();
            this.result = search.attachments().at(0);
            this.view = new chorus.views.SearchAttachment({model: this.result});
            this.view.render();
        });

        it("shows the file", function() {
            var workspace = this.result.workspace();

            expect(
                this.view.$(".description .found_in").html()).toContainTranslation(
                "attachment.found_in.workspace",
                {
                    workspaceLink: '<a href="#/workspaces/'+workspace.id+'">'+workspace.name()+'</a>'
                }
            );
        });
    });

    context("with instance", function() {
        beforeEach(function() {
            var search = rspecFixtures.searchResultWithAttachmentOnInstanceNote();
            this.result = search.attachments().at(0);
            this.view = new chorus.views.SearchAttachment({model: this.result});
            this.view.render();
        });

        it("shows the file", function() {
            var instance = this.result.instance();
            expect(
                this.view.$(".description .found_in").html()).toContainTranslation(
                "attachment.found_in.instance",
                {
                    instanceLink: '<a href="#/instances/'+instance.id+'/databases">'+instance.name()+'</a>'
                }
            );
        });
    });

    it("doesn't escape the links", function() {
        expect(this.view.$(".description .found_in").html()).toContain("<");
        expect(this.view.$(".description .found_in").html()).toContain(">");
    });

    it("shows matching name", function() {
        expect(this.view.$(".name").html()).toContain("<em>searchquery<\/em>_<em>workspace<\/em>");
    });
});
