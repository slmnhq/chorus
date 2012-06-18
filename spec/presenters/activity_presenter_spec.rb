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

    it "includes all of the event's 'additional data'" do
      stub(activity.event).additional_data do
        {
          :some_key => "foo",
          :some_other_key => "bar"
        }
      end

      hash = subject.to_hash
      hash[:some_key].should == "foo"
      hash[:some_other_key].should == "bar"
    end

    context "when the event has a workspace" do
      before do
        stub(view).current_user { FactoryGirl.build(:user) }
      end

      it "presents the workspace" do
        workspace = FactoryGirl.build(:workspace)
        stub(activity.event).workspace { workspace }

        hash = subject.to_hash
        hash[:workspace].should == Presenter.present(activity.event.workspace, view)
      end
    end

    context "when the event does not have a workspace" do
      it "doesn't include the 'workspace' key" do
        stub(activity.event).workspace { nil }

        hash = subject.to_hash
        hash.should_not have_key(:workspace)
      end
    end
  end
end
