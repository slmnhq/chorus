describe("chorus.dialogs.Attach", function() {
    beforeEach(function() {
        this.user1 = newFixtures.user({ firstName: "A Unique", lastName: "snowflake" });
        this.user2 = newFixtures.user({ firstName: "B Tyler", lastName: "Durden" });
        this.users = new chorus.collections.Base([this.user1, this.user2]);
        this.users.loaded = true;

        this.subclass = chorus.dialogs.Attach.extend({
            picklistCollectionModelContext: function(model) {
                return {
                    name: model.displayName(),
                    imageUrl: model.picklistImageUrl()
                }
            }
        });

        this.dialog = new this.subclass({ workspaceId : "33", collection: this.users });
        this.dialog.collectionClass = chorus.collections.Base;
        this.dialog.submitButtonTranslationKey = "loading";
    });

    context("when selectedAttachments have been passed", function() {
        beforeEach(function() {
            this.users = new chorus.collections.Base([newFixtures.user(), newFixtures.user()]);
            this.users.loaded = true;

            this.dialog = new this.subclass({ workspaceId : '33', collection: this.users, selectedAttachments: this.users});
            this.dialog.submitButtonTranslationKey = "loading";

            this.dialog.render();
        });

        it("renders them as selected", function() {
            expect(this.dialog.$("li").eq(0)).toHaveClass("selected");
            expect(this.dialog.$("li").eq(1)).toHaveClass("selected");
        });
    });

    describe("render", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        it("renders an item for each collection entry", function() {
            expect(this.dialog.$("li").length).toBe(this.dialog.collection.length);
        })

        it("includes an image for each entry", function() {
            var images = this.dialog.$("li img");
            expect(images.length).toBe(this.dialog.collection.length);
            expect(images.eq(0)).toHaveAttr("src", this.user1.imageUrl())
            expect(images.eq(1)).toHaveAttr("src", this.user2.imageUrl());
        });

        it("includes a name for each entry", function() {
            var names = this.dialog.$("li .name");
            expect(names.length).toBe(this.dialog.collection.length);
            expect(names.eq(0)).toContainText("Unique snowflake");
            expect(names.eq(1)).toContainText("Tyler Durden");
        })

        it("has a close window button that cancels the dialog", function() {
            expect(this.dialog.$("button.cancel").length).toBe(1);
        });

        it("has the 'Attach File' button disabled by default", function() {
            expect(this.dialog.$('button.submit')).toBeDisabled();
        });

        it("has a CollectionPicklist", function() {
            expect(this.dialog.$(".picklist")).toExist();
            expect(this.dialog.picklistView).toBeA(chorus.views.CollectionPicklist);
        });
    });

    describe("selecting attachments", function() {
        beforeEach(function() {
            this.dialog.render();
            this.dialog.$("li").eq(0).click();
            this.dialog.$("li").eq(1).click();
        });

        it("add class selected", function() {
            expect(this.dialog.$("li").eq(0)).toHaveClass("selected");
            expect(this.dialog.$("li").eq(1)).toHaveClass("selected");
        });

        it("enables the submit button", function() {
            expect(this.dialog.$('button.submit')).not.toBeDisabled();
        });

        context("clicking a previously selected attachment", function() {
            beforeEach(function() {
                this.dialog.$("li").eq(0).click();
            });

            it("removes class selected when user click previously selected attachment", function() {
                expect(this.dialog.$("li").eq(0)).not.toHaveClass("selected");
            });

            it("disable the submit button if it was the last selected item", function() {
                expect(this.dialog.$('li.selected').length).toBeGreaterThan(0);
                expect(this.dialog.$('button.submit')).not.toBeDisabled();
                this.dialog.$("li.selected").click();
                expect(this.dialog.$('li.selected').length).toBe(0);
                expect(this.dialog.$('button.submit')).toBeDisabled();
            });
        });
    });

    describe("submit", function() {
        beforeEach(function() {
            this.dialog.render();
            this.dialog.$("li").eq(1).click();
        });

        it("populates the selectedAttachments attribute", function() {
            this.dialog.$("button.submit").click();
            expect(this.dialog.selectedAttachments.length).toBe(1);
            var model = this.dialog.selectedAttachments.models[0];
            expect(model).toBe(this.dialog.collection.get(model.id));
        })

        it("dismisses the dialog", function() {
            spyOnEvent($(document), "close.facebox");

            this.dialog.$("button.submit").click();

            expect("close.facebox").toHaveBeenTriggeredOn($(document))
        });

        it("triggers the 'selectedEvent' event on itself, passing in the selected attachments", function() {
            this.selectedSpy = jasmine.createSpy("attachmentsSelected");
            this.dialog.selectedEvent = 'something:selected'
            this.dialog.bind("something:selected", this.selectedSpy);

            this.dialog.$("button.submit").click();

            expect(this.selectedSpy).toHaveBeenCalledWith(this.dialog.selectedAttachments);
        });
    });

    describe("cancel", function() {
        beforeEach(function() {
            this.dialog.render();
            this.dialog.$("li").eq(1).click();
            this.dialog.$("button.cancel").click();
        });

        it("should not populate selected attachments", function() {
            expect(this.dialog.selectedAttachments).not.toExist();
        });
    });
});
