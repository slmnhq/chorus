require "spec_helper"

describe ActivityPresenter, :type => :view do
  let(:instance) { FactoryGirl.create(:instance) }
  let(:event) { FactoryGirl.create(:instance_created_event, :instance => instance) }
  let(:activity) { Activity.find_by_event_id(event.id) }

  describe "#to_hash" do
    subject { ActivityPresenter.new(activity, view).to_hash }

    it "includes the 'actor', 'action' and 'target'" do
      subject[:action].should == "INSTANCE_CREATED"
      subject[:actor].should  == Presenter.present(activity.event.actor, view)
      subject[:target].should == Presenter.present(activity.event.instance, view)
      subject[:target_type].should == "Instance"
      subject[:id].should == activity.id
    end

    its([:timestamp]) { should == activity.created_at }
  end
end
