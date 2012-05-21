describe("chorus.views.SearchWorkspace", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult({workspace: {docs: [
            {
                entityType: "workspace",
                id: "10000",
                isDeleted: false,
                public: false,
                lastUpdatedStamp: "2012-02-24 16:08:32",
                name: "ws",
                content: "ws <i>other text</i>",
                owner: {
                    firstName: "EDC",
                    id: "InitialUser",
                    lastName: "Admin"
                },
                comments: [
                    {
                        "lastUpdatedStamp": "2012-03-08 09:57:46",
                        "isPublished": false,
                        "content": "good version",
                        "isComment": false,
                        "id": "10020",
                        "workspaceId": "10000",
                        "isInsight": false,
                        "highlightedAttributes": {"content": ["good <em>version<\/em>"]},
                        "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}
                    }
                ],
                highlightedAttributes: {
                    name: "<em>ws</em>",
                    content: "<em>ws</em> <i>other text</i>"
                }
            }
        ]}});

        this.model = this.result.workspaces().models[0];
        this.view = new chorus.views.SearchWorkspace({ model: this.model });
        this.view.render()
    });

    it("includes the correct workspace file icon", function() {
        expect(this.view.$("img.icon").attr("src")).toBe(this.model.defaultIconUrl());
    });

    it("has a link to the workspace for each workspace in the collection", function() {
        expect(this.view.$('a.name').attr('href')).toBe("#/workspaces/10000");
    });

    it("shows matching description if any", function() {
        expect(this.view.$(".description .description_content").html()).toContain("<em>ws</em> <i>other text</i>");
    });

    it("shows matching name", function() {
        expect(this.view.$(".name").html()).toContain("<em>ws</em>");
    });

    it("shows comments", function() {
        expect(this.view.$(".comments .comment").length).toBe(1);
    });

    context("the description does not contain the search string", function() {
        beforeEach(function() {
            this.result = fixtures.searchResult({workspace: {docs: [
                {
                    entityType: "workspace",
                    id: "10000",
                    isDeleted: false,
                    public: false,
                    lastUpdatedStamp: "2012-02-24 16:08:32",
                    name: "ws",
                    content: "<i>that is not highlighted</i>",
                    owner: {
                        firstName: "EDC",
                        id: "InitialUser",
                        lastName: "Admin"
                    },
                    comments: [
                        {
                            "lastUpdatedStamp": "2012-03-08 09:57:46",
                            "isPublished": false,
                            "content": "good version",
                            "isComment": false,
                            "id": "10020",
                            "workspaceId": "10000",
                            "isInsight": false,
                            "highlightedAttributes": {"content": ["good <em>version<\/em>"]},
                            "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}
                        }
                    ],
                    highlightedAttributes: {
                        name: "<em>ws</em>"
                    }
                }
            ]}});

            this.model = this.result.workspaces().models[0];
            this.view = new chorus.views.SearchWorkspace({ model: this.model });
            this.view.render()
        })

        it("uses the displaySearchMatchFromSafeField method for the description", function() {
            expect(this.view.$(".description .description_content").html()).toContain("<i>that is not highlighted</i>");
        })
    })
});
