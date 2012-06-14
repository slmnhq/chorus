require "spec_helper"

describe ActivityPresenter, :type => :view do
  let(:instance) { FactoryGirl.create(:instance) }
  let(:activity) do
    FactoryGirl.create(:activity,
      :action => "SOME_ACTION",
      :target1 => instance
    )
  end

  describe "#to_hash" do
    subject { ActivityPresenter.new(activity, view).to_hash }

    it "includes the 'actor', 'action' and 'target'" do
      subject[:action].should == "SOME_ACTION"
      subject[:actor].should  == Presenter.present(activity.actor, view)
      subject[:target].should == Presenter.present(activity.target1, view)
      subject[:target_type].should == "Instance"
      subject[:id].should == activity.id
    end

    its([:timestamp]) { should == activity.created_at }
  end
end
