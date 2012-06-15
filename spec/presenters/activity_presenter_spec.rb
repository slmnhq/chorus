require "spec_helper"

describe ActivityPresenter, :type => :view do
  let(:instance) { FactoryGirl.create(:instance) }
  let(:event) { FactoryGirl.create(:greenplum_instance_created_event, :greenplum_instance => instance) }
  let(:activity) { Activity.find_by_event_id(event.id) }

  describe "#to_hash" do
    subject { ActivityPresenter.new(activity, view) }

    it "includes the 'id', 'timestamp', 'actor', 'action'" do
      hash = subject.to_hash
      hash[:id].should == activity.id
      hash[:timestamp].should == activity.created_at
      hash[:action].should == "GREENPLUM_INSTANCE_CREATED"
      hash[:actor].should  == Presenter.present(activity.event.actor, view)
    end

    it "presents all of the event's 'targets', using the same names" do
      special_instance = FactoryGirl.build(:instance)
      special_user = FactoryGirl.build(:user)

      stub(activity.event).targets do
        {
          :special_instance => special_instance,
          :special_user => special_user
        }
      end

      hash = subject.to_hash
      hash[:special_instance].should == Presenter.present(special_instance, view)
      hash[:special_user].should == Presenter.present(special_user, view)
    end
  end
end
