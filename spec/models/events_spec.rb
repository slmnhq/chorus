require "spec_helper"

describe Events do
  describe "types" do
    let(:actor) { FactoryGirl.create(:user) }
    let(:greenplum_instance) { FactoryGirl.create(:instance) }
    let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance) }
    let(:user) { FactoryGirl.create(:user) }

    class << self

      def it_creates_activities_for(&entities_block)
        it "creates the right entity-specific activities" do
          expected_entities = instance_exec(&entities_block)
          activities = Activity.where(:event_id => subject.id)
          activities.map(&:entity).compact.should =~ expected_entities
        end
      end

      def it_creates_a_global_activity
        it "creates a global activity" do
          global_activity = Activity.global.find_by_event_id(subject.id)
          global_activity.should_not be_nil
        end
      end

    end

    describe "GREENPLUM_INSTANCE_CREATED" do
      subject do
        Events::GREENPLUM_INSTANCE_CREATED.create!(
          :actor => actor,
          :greenplum_instance => greenplum_instance,
        )
      end

      its(:greenplum_instance) { should == greenplum_instance }
      its(:targets) { should == { :greenplum_instance => greenplum_instance } }

      it_creates_activities_for { [actor, greenplum_instance] }
      it_creates_a_global_activity
    end

    describe "HADOOP_INSTANCE_CREATED" do
      subject do
        Events::HADOOP_INSTANCE_CREATED.create!(
          :actor => actor,
          :hadoop_instance => hadoop_instance,
        )
      end

      its(:hadoop_instance) { should == hadoop_instance }
      its(:targets) { should == { :hadoop_instance => hadoop_instance } }

      it_creates_activities_for { [actor, hadoop_instance] }
      it_creates_a_global_activity
    end

    describe "GREENPLUM_INSTANCE_CHANGED_OWNER" do
      subject do
        Events::GREENPLUM_INSTANCE_CHANGED_OWNER.create!(
          :actor => actor,
          :greenplum_instance => greenplum_instance,
          :new_owner => user
        )
      end

      its(:greenplum_instance) { should == greenplum_instance }
      its(:new_owner) { should == user }
      its(:targets) { should == { :greenplum_instance => greenplum_instance, :new_owner => user } }

      it_creates_activities_for { [actor, greenplum_instance] }
      it_creates_a_global_activity
    end
  end

  describe ".add(params)" do
    it "creates an event with the given parameters" do
      instance1 = FactoryGirl.create(:instance)
      instance2 = FactoryGirl.create(:instance)
      user1 = FactoryGirl.create(:user)
      user2 = FactoryGirl.create(:user)
      user3 = FactoryGirl.create(:user)

      Events::GREENPLUM_INSTANCE_CREATED.by(user1).add(:greenplum_instance => instance1)
      Events::GREENPLUM_INSTANCE_CHANGED_OWNER.by(user2).add(:greenplum_instance => instance2, :new_owner => user3)

      event1 = Events::GREENPLUM_INSTANCE_CREATED.first
      event2 = Events::GREENPLUM_INSTANCE_CHANGED_OWNER.first

      event1.actor.should == user1
      event1.greenplum_instance.should == instance1

      event2.actor.should == user2
      event2.greenplum_instance.should == instance2
      event2.new_owner.should == user3
    end
  end
end
