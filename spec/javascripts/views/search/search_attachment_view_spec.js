describe("chorus.views.SearchAttachment", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();

        this.model = this.result.attachments().models[0];
        this.view = new chorus.views.SearchAttachment({model: this.model});
        this.view.render()
    });

    it("includes the correct attachment file icon", function() {
        expect(this.view.$("img.icon").attr("src")).toBe("/images/workfiles/large/csv.png");
    });

    it("has a link to the download for the attachment", function() {
        expect(this.view.$('a.name').attr('href')).toBe(this.model.downloadUrl());
    });

    xit("shows which workspace the attachment was found in", function() {
        expect(this.view.$('.location')).toContainTranslation(
            "workspaces_used_in.body.one",
            {workspaceLink: "ws"}
        )
    });

    it("shows matching name", function() {
        expect(this.view.$(".name").html()).toContain("<em>titanic<\/em>.csv");
    });
});
