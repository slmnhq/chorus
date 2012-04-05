describe("chorus.views.NotificationRecipient", function() {
    beforeEach(function() {
        this.user1 = newFixtures.user();
        this.user2 = newFixtures.user();
        this.loggedInUser = newFixtures.user();
        setLoggedInUser({ id: this.loggedInUser.get("id") });
        
        this.users = fixtures.userSet([this.user1, this.user2, this.loggedInUser]);
        this.users.sortAsc("firstName");

        this.view = new chorus.views.NotificationRecipient();
    });

    it("should fetch the list of users", function() {
        expect(this.server.lastFetchFor(this.users)).toBeDefined();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("should display a loading section", function() {
            expect(this.view.$(".loading_spinner")).toExist();
        });

        it("does not have any items in the list", function() {
            expect(this.view.$(".picked_users li").length).toBe(0);
            expect(this.view.getPickedUsers()).toEqual([]);
        });

        context("when the user fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchAllFor(this.users, this.users.models);
            });

            it("shows the add another person link", function() {
                expect(this.view.$("a.add")).not.toHaveClass("hidden");
            });

            it("should display a dropdown containing all elligible recipients", function() {
                expect(this.view.$("select")).not.toHaveClass("hidden");
                expect(this.view.$("select option").length).toBe(3);

                expect(this.view.$("select option:eq(1)")).toContainText(this.user1.displayName());
                expect(this.view.$("select option:eq(1)").val()).toContain(this.user1.get("id"));

                expect(this.view.$("select option:eq(2)")).toContainText(this.user2.displayName());
                expect(this.view.$("select option:eq(2)").val()).toContain(this.user2.get("id"));

                expect(this.view.$("select").val()).toBe("");
            });

            it("does not display the logged in user as an elligible recipient", function() {
                expect(this.view.$("option[value=" + this.loggedInUser.get("id") + "]")).not.toExist();
            })

            context("when the add user link is clicked", function() {
                beforeEach(function() {
                    this.oldSelectableUserCount = this.view.$("select option").length - 1;
                    spyOn(chorus, "styleSelect");
                    this.view.$("select").val(this.user1.id.toString());
                    this.view.$("a.add").click();
                });

                itHasOnlyTheFirstUser();

                it("goes back to the blank select option", function() {
                    expect(this.view.$("select").val()).toBe("");
                    expect(chorus.styleSelect).toHaveBeenCalled();
                });

                context("trying to add the blank user option", function() {
                    beforeEach(function() {
                        this.view.$("a.add").click();
                    });

                    itHasOnlyTheFirstUser();
                });

                it("removes the selected user from the list of possible users", function() {
                    expect(this.view.$("select option").length - 1).toBe(this.oldSelectableUserCount - 1);
                });

                context("adding the same user", function() {
                    beforeEach(function() {
                        this.view.$("select").val(this.user1.id.toString());
                        this.view.$("a.add").click();
                    });

                    itHasOnlyTheFirstUser();
                });

                context("adding another user", function() {
                    beforeEach(function() {
                        this.view.$("select").val(this.user2.id);
                        this.view.$("a.add").click();
                    });

                    it("makes an entry with that user at the bottom the picked_users list", function() {
                        expect(this.view.$(".picked_users li").length).toBe(2);
                        expect(this.view.$(".picked_users li:eq(0) .name")).toContainText(this.user1.displayName());
                        expect(this.view.$(".picked_users li:eq(1) .name")).toContainText(this.user2.displayName());
                    });

                    it("returns an array containing both selected users' IDs", function() {
                        expect(this.view.getPickedUsers().length).toBe(2);
                        expect(this.view.getPickedUsers()).toContain(this.user1.id.toString());
                        expect(this.view.getPickedUsers()).toContain(this.user2.id.toString());
                    });

                    context("removing the new user", function() {
                        beforeEach(function() {
                            this.view.$("select").val(this.user1.id);
                            this.view.$(".picked_users li:eq(1) .remove").click();
                        });

                        itHasOnlyTheFirstUser();
                    });
                });

                context("when the remove link is clicked", function() {
                    beforeEach(function() {
                        this.view.$(".picked_users li:eq(0) .remove").click();
                    });

                    it("should remove the user from the picked_users list", function() {
                        expect(this.view.$(".picked_users li").length).toBe(0);
                    });

                    it("should remove the user's ID from the internal array", function() {
                        expect(this.view.getPickedUsers().length).toBe(0);
                    });
                });

                function itHasOnlyTheFirstUser() {
                    it("has an entry with that user in the picked_users list", function() {
                        expect(this.view.$(".picked_users li").length).toBe(1);
                        expect(this.view.$(".picked_users li:eq(0) .name")).toContainText(this.user1.displayName());
                    });

                    it("returns an array containing only that user's ID", function() {
                        expect(this.view.getPickedUsers().length).toBe(1);
                        expect(this.view.getPickedUsers()).toContain(this.user1.id.toString());
                    });
                }
            });
        });
    });
});
