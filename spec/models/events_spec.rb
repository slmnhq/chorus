require "spec_helper"

describe Events do
  let!(:user) { FactoryGirl.create :user }

  describe "types" do
    let(:greenplum_instance) { FactoryGirl.create(:instance) }
    let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance) }
    let(:user) { FactoryGirl.create(:user) }

    let(:target1) { nil }
    let(:target2) { nil }

    subject do
      klass.create!(:actor => user, :target1 => target1, :target2 => target2)
    end

    let(:activities) { Activity.where(:event_id => subject.id) }
    let(:global_activity) { Activity.global.find_by_event_id(subject.id) }

    class << self

      def it_creates_activities_for(&block)
        it "creates the right entity-specific activities" do
          entities = self.instance_exec(&block)
          activities.map(&:entity).compact.should =~ entities
        end
      end

      def it_creates_a_global_activity
        it "creates a global activity" do
          global_activity.should_not be_nil
        end
      end

    end

    describe "GREENPLUM_INSTANCE_CREATED" do
      let(:klass) { Events::GREENPLUM_INSTANCE_CREATED }
      let(:target1) { greenplum_instance }

      its(:greenplum_instance) { should == greenplum_instance }
      its(:targets) { should == { :greenplum_instance => greenplum_instance } }

      it_creates_activities_for { [user, greenplum_instance] }
      it_creates_a_global_activity
    end

    describe "HADOOP_INSTANCE_CREATED" do
      let(:klass) { Events::HADOOP_INSTANCE_CREATED }
      let(:target1) { hadoop_instance }

      its(:hadoop_instance) { should == hadoop_instance }
      its(:targets) { should == { :hadoop_instance => hadoop_instance } }

      it_creates_activities_for { [user, hadoop_instance] }
      it_creates_a_global_activity
    end

    describe "GREENPLUM_INSTANCE_CHANGED_OWNER" do
      let(:klass) { Events::GREENPLUM_INSTANCE_CHANGED_OWNER }
      let(:target1) { greenplum_instance }
      let(:target2) { user }

      its(:greenplum_instance) { should == greenplum_instance }
      its(:new_owner) { should == user }
      its(:targets) { should == { :greenplum_instance => greenplum_instance, :new_owner => user } }

      it_creates_activities_for { [user, greenplum_instance] }
      it_creates_a_global_activity
    end
  end

  describe ".add(params)" do
    it "creates an event with the given parameters" do
      instance1 = FactoryGirl.create(:instance)
      instance2 = FactoryGirl.create(:instance)
      user2 = FactoryGirl.create(:user)
      user3 = FactoryGirl.create(:user)

      Events::GREENPLUM_INSTANCE_CREATED.by(user).add(:greenplum_instance => instance1)
      Events::GREENPLUM_INSTANCE_CHANGED_OWNER.by(user2).add(:greenplum_instance => instance2, :new_owner => user3)

      event1 = Events::GREENPLUM_INSTANCE_CREATED.first
      event2 = Events::GREENPLUM_INSTANCE_CHANGED_OWNER.first

      event1.actor.should == user
      event1.greenplum_instance.should == instance1

      event2.actor.should == user2
      event2.greenplum_instance.should == instance2
      event2.new_owner.should == user3
    end
  end
end
