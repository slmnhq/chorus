require "spec_helper"

describe Events do
  let!(:user) { FactoryGirl.create :user }

  describe "types" do
    let(:instance) { FactoryGirl.create(:instance) }
    let(:user) { FactoryGirl.create(:user) }

    let(:target1) { nil }
    let(:target2) { nil }

    subject do
      klass.create!(:actor => user, :target1 => target1, :target2 => target2)
    end

    let(:activities) { Activity.where(:event_id => subject.id) }
    let(:global_activity) { Activity.global.find_by_event_id(subject.id) }

    describe "INSTANCE_CREATED" do
      let(:klass) { Events::INSTANCE_CREATED }
      let(:target1) { instance }

      its(:instance) { should == instance }
      its(:targets) { should == { :instance => instance } }

      it "creates activities for the instance and for the actor, and one global activity (with no entity)" do
        activities.map(&:entity).should =~ [ user, instance, nil ]
        global_activity.should_not be_nil
      end
    end

    describe "INSTANCE_CHANGED_OWNER" do
      let(:klass) { Events::INSTANCE_CHANGED_OWNER }
      let(:target1) { instance }
      let(:target2) { user }

      its(:instance) { should == instance }
      its(:new_owner) { should == user }
      its(:targets) { should == { :instance => instance, :new_owner => user } }

      it "creates activities for the instance and for the actor, and one global activity (with no entity)" do
        activities.map(&:entity).should =~ [ instance, user, nil ]
        global_activity.should_not be_nil
      end
    end
  end

  describe ".add(params)" do
    it "creates an event with the given parameters" do
      instance1 = FactoryGirl.create(:instance)
      instance2 = FactoryGirl.create(:instance)
      user2 = FactoryGirl.create(:user)
      user3 = FactoryGirl.create(:user)

      Events::INSTANCE_CREATED.new(:foo => "bar")

      Events::INSTANCE_CREATED.by(user).add(:instance => instance1)
      Events::INSTANCE_CHANGED_OWNER.by(user2).add(:instance => instance2, :new_owner => user3)

      event1 = Events::INSTANCE_CREATED.first
      event2 = Events::INSTANCE_CHANGED_OWNER.first

      event1.actor.should == user
      event1.instance.should == instance1

      event2.actor.should == user2
      event2.instance.should == instance2
      event2.new_owner.should == user3
    end
  end
end
