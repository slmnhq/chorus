describe("chorus.dialogs.WorkspaceMembersMore", function() {
    var workspace, dialog, members;
    beforeEach(function() {
        workspace = newFixtures.workspace();
        dialog = new chorus.dialogs.WorkspaceMembersMore({ pageModel: workspace });
        members = workspace.members();
        _.times(25, function() {
            members.add(rspecFixtures.user());
        });
        var self = this
        self.choice = "lastName"
        sortedMembers = _.sortBy(members.models, function(member) {
            return member.get(self.choice);
        });
    });

    it("does not re-render when the model changes", function() {
        expect(dialog.persistent).toBeTruthy()
    })

    describe("render", function() {
        beforeEach(function() {
            dialog.render();
        });

        it("includes an image for each member", function() {
            var images = dialog.$(".collection_list img");
            expect(images.length).toBe(sortedMembers.length);
            expect(images.eq(0).attr("src")).toBe(sortedMembers[0].fetchImageUrl({ size: 'icon' }));
            expect(images.eq(1).attr("src")).toBe(sortedMembers[1].fetchImageUrl({ size: 'icon' }));
        });

        it("includes a name for each member", function() {
            var names = dialog.$('.name');
            expect(names.length).toBe(sortedMembers.length);
            expect(names.eq(0).text().trim()).toBe(sortedMembers[0].displayName());
            expect(names.eq(23).text().trim()).toBe(sortedMembers[23].displayName());
        })

        it("shows the member count", function() {
            expect(dialog.$('.member_count').text().trim()).toMatchTranslation('workspace.members_count', {count: sortedMembers.length});
        });

        it("has a close window button that cancels the dialog", function() {
            expect(dialog.$("button.cancel").length).toBe(1);
        })

        describe("sorting", function() {
            it("has a sort by menu", function() {
                expect(dialog.$(".sort_menu .menus").length).toBe(1)
            })

            it("sorts", function() {
                members.models[20].set({firstName : "AAAAA"});
                expect(dialog.$('.name').eq(0).text()).not.toContain("AAAAA")
                dialog.$(".menu li[data-type=firstName] a").click()
                expect(dialog.$('.name').eq(0).text()).toContain("AAAAA")
            })
        })
    });
});
