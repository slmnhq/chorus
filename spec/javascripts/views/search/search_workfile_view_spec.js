describe("chorus.views.SearchWorkfile", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult({workfile: {docs: [
            {
                id: "1",
                workspace: {id: "2", name: "Test"},
                fileType: "SQL",
                mimeType: 'text/text',
                comments: [
                    {highlightedAttributes: { "content": "nice <em>cool<\/em> file"   }, "content": "nice cool file", "lastUpdatedStamp": "2012-02-28 14:07:34", "isPublished": false, "id": "10000", "workspaceId": "10000", "isComment": false, "isInsight": false, "owner": {"id": "InitialUser", "last_name": "Admin", "first_name": "EDC"}},
                    {highlightedAttributes: { "content": "nice <em>cool<\/em> comment"}, "content": "nice cool comment", "lastUpdatedStamp": "2012-02-28 14:07:46", "isPublished": false, "id": "10001", "workspaceId": "10000", "isComment": true, "isInsight": false, "owner": {"id": "InitialUser", "last_name": "Admin", "first_name": "EDC"}},
                    {highlightedAttributes: { "content": "Nice <em>cool<\/em> insight"}, "content": "Nice cool insight", "lastUpdatedStamp": "2012-02-28 14:09:56", "isPublished": false, "id": "10002", "workspaceId": "10000", "isComment": false, "isInsight": true, "owner": {"id": "InitialUser", "last_name": "Admin", "first_name": "EDC"}},
                    {highlightedAttributes: { "content": "Nice <em>cool<\/em> insight"}, "content": "Nice cool insight", "lastUpdatedStamp": "2012-02-28 14:09:56", "isPublished": false, "id": "10003", "workspaceId": "10000", "isComment": false, "isInsight": true, "owner": {"id": "InitialUser", "last_name": "Admin", "first_name": "EDC"}}
                ],
                versionInfo: {
                    lastUpdatedStamp: "2012-04-02 14:56:19.34",
                    modifiedBy: {id:"InitialUser", last_name:"Admin", first_name:"EDC"},
                    versionFileId: "1333403779156_199",
                    versionNum: 1,
                    versionOwner: "edcadmin"
                }
            },
            {
                id: "4",
                workspace: {id: "3", name: "Other"},
                fileType: "txt",
                mimeType: 'text/text',
                description: "this is a cool file description",
                highlightedAttributes: {
                    description: "this is a <EM>cool</EM> file description",
                    fileName: "<em>cool</em> file"
                }
            }
        ]}});

        this.model = this.result.workfiles().models[0];
        this.model.set({highlightedAttributes: {fileName : "<em>cool</em> file"}});
        this.view = new chorus.views.SearchWorkfile({model: this.model});
        this.view.render()
    });

    it("includes the correct workspace file icon", function() {
        expect(this.view.$("img.icon").attr("src")).toBe("/images/workfiles/large/sql.png");
    });

    it("has a link to the workfile for each workfile in the collection", function() {
        expect(this.view.$('a.name').attr('href')).toBe("#/workspaces/2/workfiles/1/versions/1");
    });

    it("shows which workspace each result was found in", function() {
        expect(this.view.$('.location')).toContainTranslation(
            "workspaces_used_in.body.one",
            {workspaceLink: "Test"}
        )
    })

    it("shows matching description if any", function() {
        expect(this.view.$(".description .description_content")).toBeEmpty();
    });

    it("shows matching name", function() {
        expect(this.view.$(".name").html()).toContain("<em>cool</em> file");
    });

    describe("thumbnails", function() {
        it("uses the thumbnail when the workfile is an image", function() {
            spyOn(this.model, "isImage").andReturn(true);
            this.view.render();
            expect(this.view.$("img")).toHaveAttr("src", this.model.thumbnailUrl());
        });

        it("uses the icon when the workfile is not an image", function() {
            spyOn(this.model, "isImage").andReturn(false);
            this.view.render();
            expect(this.view.$("img")).toHaveAttr("src", this.model.iconUrl());
        });
    });

    describe("shows version commit messages in the comments area", function() {
        beforeEach(function() {
            this.view.model.set({
                highlightedAttributes: {
                    commitMessage: [
                        "this is a <em>cool</em> version",
                        "this is a <em>cooler</em> version"
                    ]}
            });
            this.view.render();
        });

        it("looks correct", function() {
            expect(this.view.$('.more_comments .comment:eq(2) .comment_type').text().trim()).toBe('');
            expect(this.view.$('.more_comments .comment:eq(2) .comment_content').html()).toContain("this is a <em>cooler</em> version");
        });
    });
});
