describe("chorus.presenters.Base", function() {
    beforeEach(function() {
        this.model = new Backbone.Model({bestFriend: "Larry Wall"});
        this.model.loaded = true;
        this.model.serverErrors = ["too few ponies– requires at least three"];
        this.presenter = new chorus.presenters.Base(this.model)
    });

    it("presents the model's loaded property", function() {
       expect(this.presenter.loaded).toBe(true);
    });

    it("presents the model's server errors", function() {
       expect(this.presenter.serverErrors).toEqual(["too few ponies– requires at least three"]);
    });

    it("presents the model's attributes", function() {
        expect(this.presenter.bestFriend).toBe("Larry Wall");
    });


    context("deriving from Base", function() {
        beforeEach(function(){
            this.model.loaded = true

            this.RadPresenter = chorus.presenters.Base.extend({
                present : function(model) {
                    return {
                        radical : "totally",
                        loaded : false,
                        newBestFriend : model.get("bestFriend")
                    }
                }
            })

            this.presenter = new this.RadPresenter(this.model)
        })

        it("meges the subclasses present", function(){
            expect(this.presenter.radical).toBe("totally")
        })

        it("gives the subclasses present a higher precedence", function(){
            expect(this.presenter.loaded).toBe(false)
        })

        it("respects the models not overwritten attributes", function(){
            expect(this.presenter.serverErrors).toEqual(["too few ponies– requires at least three"]);
        })

        it("passes the original model to the subclass", function() {
            expect(this.presenter.newBestFriend).toBe("Larry Wall");
        });
    });
});