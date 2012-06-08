require "spec_helper"

describe ActivityPresenter, :type => :view do
  let(:activity) do
    FactoryGirl.create(:activity, {
      :action => "SOME_ACTION"
    })
  end

  describe "#to_hash" do
    let(:hash) { ActivityPresenter.new(activity, view).to_hash }

    it "includes the 'actor', 'action' and 'target'" do
      hash[:action].should == "SOME_ACTION"
      hash[:actor].should  == Presenter.present(activity.actor, view)
      hash[:target].should == Presenter.present(activity.target, view)
    end
  end
end
