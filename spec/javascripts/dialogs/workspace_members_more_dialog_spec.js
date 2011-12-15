describe("WorkspaceMembersMore", function() {
    var workspace, dialog, members;
    beforeEach(function() {
        this.loadTemplate("workspace_members_more");
        workspace = fixtures.workspace();
        dialog = new chorus.dialogs.WorkspaceMembersMore({ pageModel: workspace });
        members = workspace.members();
        _.times(25, function() {
            members.add(fixtures.user());
        });
    });

    describe("render", function() {
        beforeEach(function() {
           dialog.render();
        });

        it("includes an image for each member", function() {
            var images = dialog.$("img");
            expect(images.length).toBe(members.length);
            expect(images.eq(0).attr("src")).toBe(members.models[0].imageUrl({ size: 'icon' }));
            expect(images.eq(1).attr("src")).toBe(members.models[1].imageUrl({ size: 'icon' }));
        });

        it("includes a name for each member", function() {
            var names = dialog.$('.name');
            expect(names.length).toBe(members.length);
            expect(names.eq(0).text().trim()).toBe(members.models[0].displayName());
            expect(names.eq(23).text().trim()).toBe(members.models[23].displayName());
        })

        it("shows the member count", function() {
           expect(dialog.$('.member_count').text().trim()).toMatchTranslation('workspace.members.count', members.length);
        });

        it("has a close window button that cancels the dialog", function() {
            expect(dialog.$("button.cancel").length).toBe(1);
        })
    });
});