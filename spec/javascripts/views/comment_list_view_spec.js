describe("chorus.views.CommentList", function() {
    beforeEach(function() {
        this.comment1 = fixtures.noteComment({
            text : "Yes we can",
            isInsight: true,
            author : {
                firstName : "Barack",
                lastName : "Obama",
                id : "45"
            }
        });
        this.comment2 = fixtures.noteComment({
            text : "No hate plz"
        });
        this.comment3 = fixtures.comment();
        this.comments = new chorus.collections.CommentSet([this.comment1, this.comment2, this.comment3], {
            entityId: 10000,
            entityType: "workspace"
        });
        this.view = new chorus.views.CommentList({ collection: this.comments, initialLimit: 2 });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
            this.listItems = this.view.$("li.comment");
        });

        it("displays all the comments", function() {
            expect(this.listItems.length).toBe(3);
        });

        it("displays the time of each comment's creation", function() {
            expect(this.listItems.eq(0).find(".comment_content .timestamp")).toExist();
        });

        it("displays the text of each comment", function() {
            expect(this.listItems.eq(0).find(".body")).toHaveText("Yes we can");
            expect(this.listItems.eq(1).find(".body")).toHaveText("No hate plz");
        })

        it("displays the name of each comment's author", function() {
            expect(this.listItems.eq(0).find("a.author").text()).toBe("Barack Obama");
        });

        it("displays the profile image of each comment's author", function() {
            expect(this.listItems.eq(0).find("img").attr('src')).toBe(this.comment1.author().imageUrl({ size: "original" }));
        });

        it("displays the insight ribbon when appropriate", function() {
            expect(this.listItems.eq(0).find(".insight_ribbon")).toExist();
            expect(this.listItems.eq(1).find(".insight_ribbon")).not.toExist();
        });

        describe("header rendering", function() {
            beforeEach(function() {
                this.view.options.displayStyle = 'without_workspace';
                this.view.render();
            });

            it("is correct for notes", function() {
                expect(this.view.$('.comment_header:eq(0)').text()).toMatch(this.comment1.get('workspace').get('name'));
            });

            it("sets a displayStyle of without_workspace on the presenter", function() {
                expect(this.view.collectionModelContext(this.comment1)._impl.options.displayStyle).toBe('without_workspace');
            });

            it("is correct for comments", function() {
                expect(this.view.$('.comment_header:eq(2)').text()).toMatch('commented');
            });
        });

        context("when there are more comments than the specified 'initial limit'", function() {
            it("displays a 'more' link", function() {
                expect(this.view.$("a.more")).toExist();
            });

            it("applies the 'more' class to the extra elements", function() {
                expect(this.view.$("li:eq(0)")).not.toHaveClass("more");
                expect(this.view.$("li:eq(1)")).not.toHaveClass("more");
                expect(this.view.$("li:eq(2)")).toHaveClass("more");
            });
        });

        context("when there are fewer comments than the specified 'initial limit'", function() {
            beforeEach(function() {
                this.comments.remove(this.comment1);
                expect(this.comments.models.length).toBe(2);
                this.view.render();
            });

            it("does not render a 'more' link", function() {
                expect(this.view.$("a.more")).not.toExist();
            });

            it("applies the 'more' class to the extra elements", function() {
                expect(this.view.$("li.more")).not.toExist();
            });
        });

        context("when the current user is an admin", function() {
            beforeEach(function() {
                setLoggedInUser({admin: true});
                this.view.render();
            });

            it("displays a delete link", function() {
                expect(this.view.$(".delete_link")).toExist();
            })
        })

        context("when the current user is not an admin", function() {
            context("and is the author of the note", function() {
                beforeEach(function() {
                    setLoggedInUser({id: this.comment1.get("author").id});
                    this.view.render();
                });

                it("displays a delete link", function() {
                    expect(this.view.$(".delete_link")).toExist();
                })
            })

            context("and is not the author of the note", function() {
                it("does not display a delete link", function() {
                    expect(this.view.$(".delete_link")).not.toExist();
                })

                context("but is the owner of the workspace", function() {
                    beforeEach(function() {
                        this.view.options.currentUserOwnsWorkspace = true;
                        this.view.render();
                    });

                    it("displays a delete link", function() {
                        expect(this.view.$(".delete_link")).toExist();
                    });
                })
            })
        })

        context("when the delete link appears", function() {
            beforeEach(function() {
                setLoggedInUser({id: this.comment1.get("author").id});
                this.view.render();

                var commentId = this.view.$(".delete_link").data("commentId");
                var comment = this.view.collection.get(commentId);

                // put view in page for correct alert click handling
                this.page = new chorus.pages.Base();
                chorus.bindModalLaunchingClicks(this.page);
                this.page.mainContent = this.view;
                this.page.render();
            });

            it("shows the hidden delete comment link", function() {
                var deleteLink = this.view.$(".delete_link");
                expect(deleteLink).toExist();
                expect(deleteLink.text()).toContainTranslation("actions.delete")
                expect(deleteLink).toBeHidden();
            })

            it("puts the right data attributes on the delete link", function() {
                var deleteLink = this.view.$(".delete_link");
                expect(deleteLink.data("entityId")).toBe(10000);
                expect(deleteLink.data("entityType")).toBe("workspace");
                expect(deleteLink.data("commentId").toString()).toBe(this.comment1.id.toString());
            });

            describe("clicking the delete link", function() {
                beforeEach(function() {
                    stubModals()
                    this.view.$(".delete_link").click();
                });

                it("launches a delete note confirm alert", function() {
                    expect(chorus.modal).toBeA(chorus.alerts.DeleteNoteConfirmAlert);
                    expect(chorus.modal.model).toBeA(chorus.models.Comment);
                    expect(chorus.modal.model.id.toString()).toBe(this.comment1.id)
                    expect(chorus.modal.model.attributes.entityId).toBe(10000)
                    expect(chorus.modal.model.attributes.entityType).toBe("workspace")
                });
            });
        })
    });
});
