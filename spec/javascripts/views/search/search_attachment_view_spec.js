describe("chorus.views.SearchAttachment", function() {
    beforeEach(function() {
        this.result = fixtures.attachmentOnDatasetInWorkspaceSearchResult();
        this.view = new chorus.views.SearchAttachment({model: this.result});
        this.view.render()
    });

    it("shows the thumbnail for an image", function() {
        expect(this.view.$("img.icon").attr("src")).toBe(this.result.thumbnailUrl());
    });

    it("shows the iconUrl for a non-image", function() {
        this.result.set({fileType: "OTHER"})
        expect(this.view.$("img.icon").attr("src")).toBe(this.result.iconUrl());
    });

    it("has a link to the download for the attachment", function() {
        expect(this.view.$('a.name').attr('href')).toBe(this.result.downloadUrl());
    });

    context("with a workspace and tabular data", function() {
        it("shows workspace and tabular data set", function() {
            var encoded_id = encodeURIComponent('"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"2010_report_on_white_house"');
            expect(
                this.view.$(".description .found_in").html()).toContainTranslation(
                "attachment.found_in.tabular_data_in_workspace",
                {
                    workspaceLink: '<a href="#/workspaces/33333">ws</a>',
                    tabularDataLink: '<a href="#/workspaces/33333/datasets/' + encoded_id + '">2010_report_on_white_house</a>'
                }
            );
        });
    });

    context("with tabular data but no workspace", function() {
        beforeEach(function() {
            this.result = fixtures.attachmentOnDatasetNotInWorkspaceSearchResult();
            this.view = new chorus.views.SearchAttachment({model: this.result});
            this.view.render();
        });

        it("shows the tabular data set", function() {
            expect(
                this.view.$(".description .found_in").html()).toContainTranslation(
                "attachment.found_in.tabular_data_not_in_workspace",
                {
                    tabularDataLink: '<a href="#/instances/22222/databases/dca_demo/schemas/ddemo/BASE_TABLE/2010_report_on_white_house">2010_report_on_white_house</a>'
                }
            );
        });
    });

    context("with workfile in a workspace", function() {
        beforeEach(function() {
            this.result = fixtures.attachmentOnWorkfileInWorkspaceSearchResult();
            this.view = new chorus.views.SearchAttachment({model: this.result});
            this.view.render();
        });

        it("shows the workfile set", function() {
            expect(
                this.view.$(".description .found_in").html()).toContainTranslation(
                "attachment.found_in.workfile_in_workspace",
                {
                    workfileLink: '<a href="#/workspaces/10000/workfiles/10030">buildout.txt</a>',
                    workspaceLink: '<a href="#/workspaces/10000">ws</a>'
                }
            );
        });
    });

    context("with file in a hdfs", function() {
        beforeEach(function() {
            this.result = fixtures.attachmentOnFileInHdfsSearchResult();
            this.view = new chorus.views.SearchAttachment({model: this.result});
            this.view.render();
        });

        it("shows the file", function() {
            expect(
                this.view.$(".description .found_in").html()).toContainTranslation(
                "attachment.found_in.file_in_hdfs",
                {
                    hdfsFileLink: '<a href="#/instances/10020/browseFile/data/cleardb.sql">cleardb.sql</a>'
                }
            );
        });
    });

    context("with workspace", function() {
        beforeEach(function() {
            this.result = fixtures.attachmentOnWorkspaceSearchResult();
            this.view = new chorus.views.SearchAttachment({model: this.result});
            this.view.render();
        });

        it("shows the file", function() {
            expect(
                this.view.$(".description .found_in").html()).toContainTranslation(
                "attachment.found_in.workspace",
                {
                    workspaceLink: '<a href="#/workspaces/10000">ws</a>'
                }
            );
        });
    });

    context("with instance", function() {
        beforeEach(function() {
            this.result = fixtures.attachmentOnInstanceSearchResult();
            this.view = new chorus.views.SearchAttachment({model: this.result});
            this.view.render();
        });

        it("shows the file", function() {
            expect(
                this.view.$(".description .found_in").html()).toContainTranslation(
                "attachment.found_in.instance",
                {
                    instanceLink: '<a href="#/instances/10000/databases">gillette</a>'
                }
            );
        });
    });

    it("doesn't escape the links", function() {
        expect(this.view.$(".description .found_in").html()).toContain("<");
        expect(this.view.$(".description .found_in").html()).toContain(">");
    });

    it("shows matching name", function() {
        expect(this.view.$(".name").html()).toContain("<em>Titanic<\/em><em>2</em>.jpg");
    });
});
