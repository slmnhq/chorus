describe("chorus.Modal", function() {
    beforeEach(function() {
        this.model = new chorus.models.Base();
        this.modal = new chorus.Modal({ pageModel: this.model });
        stubModals();
    });

    describe("intialization", function() {
        context("when a model option is provided", function() {
            it("sets the model on the view", function() {
                var otherModel = new chorus.models.User({ id: 1 });
                this.modal = new chorus.Modal({ pageModel: this.model, model: otherModel });
                expect(this.modal.model).toBe(otherModel);
            });
        });

        context("when no model is passed", function() {
            it("sets the model to the pageModel", function() {
                expect(this.modal.model).toBe(this.model);
            });
        });

        it("sets the pageModel", function() {
            expect(this.modal.pageModel).toBe(this.model);
        });
    });

    describe("#launchModal", function() {
        describe("when chorus.modal already exists", function() {
            beforeEach(function() {
                this.parentModal = new chorus.Modal();
                this.parentModal.className = this.modal.className = "plain_text";
                this.parentModal.launchModal();
                spyOn(this.parentModal, "launchSubModal").andCallThrough();

                this.modal.launchModal();
            });

            it("calls launchSubmodal on the parent modal", function() {
                expect(this.parentModal.launchSubModal).toHaveBeenCalledWith(this.modal);
            });

            it("displays the new dialog", function() {
                expect(chorus.modal).toBe(this.modal);
                expect(this.modal.previousModal).toBe(this.parentModal);
            });
        });

        describe("when there is no existing chorus.modal", function() {
            beforeEach(function() {
                delete chorus.modal;

                //Modal is abstract, so we need to give it a template to render
                //this is the responsibility of subclasses
                this.modal.className = "plain_text"

                this.modal.launchModal();
            });

            it("sets chorus.modal", function() {
                expect(chorus.modal).toBe(this.modal)
            });

            describe("re-rendering", function() {
                beforeEach(function() {
                    spyOn($.fn, "css")
                    this.modal.render();
                });

                it("re-centers the modal", function() {
                    var calls = $.fn.css.calls;
                    expect(calls.length).toBe(1);
                    expect(calls[0].args).toEqual(["left", jasmine.any(Number)])
                    expect(calls[0].object.selector).toBe("#facebox")
                });
            });

            describe("when the facebox closes", function() {
                beforeEach(function() {
                    this.modalClosedSpy = jasmine.createSpy("modal:closed")
                    chorus.PageEvents.subscribe("modal:closed", this.modalClosedSpy)
                    spyOn(this.modal, 'close');
                    $("#jasmine_content").append("<div id='facebox'/>")
                    $.facebox.settings.inited = true;
                    $(document).trigger("close.facebox");
                });

                it("calls the 'close' hook", function() {
                    expect(this.modal.close).toHaveBeenCalled();
                });

                it("deletes the chorus.modal object", function() {
                    expect(chorus.modal).toBeUndefined()
                });

                it("resets facebox", function() {
                    expect($.facebox.settings.inited).toBeFalsy();
                });

                it("removes the #facebox element from the DOM", function() {
                    expect($("#facebox")).not.toExist();
                });

                it("triggers the modal:closed page event", function() {
                    expect(this.modalClosedSpy).toHaveBeenCalled()
                });
            });
        });
    });

    describe("launching a sub modal", function() {
        function expectForegrounded(faceboxProxy, faceboxOverlayProxy) {
            expect(faceboxProxy.attr("id")).toBe("facebox");
            expect(faceboxOverlayProxy.attr("id")).toBe("facebox_overlay");
            expect(faceboxProxy).not.toHaveClass("hidden");
        }

        function expectBackgrounded(faceboxProxy, faceboxOverlayProxy) {
            expect(faceboxProxy.attr("id")).not.toBe("facebox");
            expect(faceboxOverlayProxy.attr("id")).not.toBe("facebox_overlay");
            expect(faceboxProxy).toHaveClass("hidden");
        }

        beforeEach(function() {
            this.modal.className = "plain_text"
            this.modal.launchModal();

            this.faceboxProxy = $("<div id='facebox'/>");
            this.faceboxOverlayProxy = $("<div id='facebox_overlay'/>");
            $("#jasmine_content").append(this.faceboxProxy).append(this.faceboxOverlayProxy);

            this.subModal = new chorus.Modal({ pageModel: this.model });
            this.subModal.className = this.modal.className
            spyOn(this.subModal, "launchNewModal").andCallThrough();
            $.facebox.settings.inited = true;
            this.modal.launchSubModal(this.subModal)
        });

        it("backgrounds this modal", function() {
            expectBackgrounded(this.faceboxProxy, this.faceboxOverlayProxy)
        });

        it("resets facebox", function() {
            expect($.facebox.settings.inited).toBeFalsy();
        });

        it("launches the sub modal", function() {
            expect(this.subModal.launchNewModal).toHaveBeenCalled();
        });

        describe("when the sub modal is closed", function() {
            beforeEach(function() {
                $(document).trigger("close.facebox");
            });

            it("foregrounds the preceeding dialog", function() {
                expectForegrounded(this.faceboxProxy, this.faceboxOverlayProxy)
            });
        });

        context("launching a sub-sub modal", function() {
            beforeEach(function() {
                this.faceboxProxy2 = $("<div id='facebox'/>");
                this.faceboxOverlayProxy2 = $("<div id='facebox_overlay'/>");
                $("#jasmine_content").append(this.faceboxProxy2).append(this.faceboxOverlayProxy2);

                this.subSubModal = new chorus.Modal({ pageModel: this.model });
                this.subSubModal.className = this.modal.className;
                spyOn(this.subSubModal, "launchNewModal").andCallThrough();
                $.facebox.settings.inited = true;
                this.subModal.launchSubModal(this.subSubModal)
            });

            it("keeps original modal in background", function() {
                expectBackgrounded(this.faceboxProxy, this.faceboxOverlayProxy)
            });

            it("backgrounds this modal", function() {
                expectBackgrounded(this.faceboxProxy2, this.faceboxOverlayProxy2)
            })

            it("launches the sub modal", function() {
                expect(this.subSubModal.launchNewModal).toHaveBeenCalled();
            })

            describe("when the sub-sub modal is closed", function() {
                beforeEach(function() {
                    $(document).trigger("close.facebox");
                });

                it("keeps original modal in background", function() {
                    expectBackgrounded(this.faceboxProxy, this.faceboxOverlayProxy)
                });

                it("foregrounds the preceeding dialog", function() {
                    expectForegrounded(this.faceboxProxy2, this.faceboxOverlayProxy2)
                });

                context("when the sub modal is closed", function() {
                    beforeEach(function() {
                        $(document).trigger("close.facebox");
                    });

                    it("foregrounds the original modal", function() {
                        expectForegrounded(this.faceboxProxy, this.faceboxOverlayProxy)
                    });
                });
            });
        });
    });
});
