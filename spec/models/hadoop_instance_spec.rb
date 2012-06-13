require 'spec_helper'

describe HadoopInstance do
  subject { FactoryGirl.build :hadoop_instance }

  describe "associations" do
    it { should belong_to :owner }
    its(:owner) { should be_a User }
    it { should have_many :activities }
  end

  describe "validations" do
    it { should validate_presence_of :host }
    it { should validate_presence_of :name }
    it { should validate_presence_of :port }
  end

  describe "when a hadoop instance is created" do
    it "creates an INSTANCE_CREATED activity with the right 'target'" do
      user = FactoryGirl.create :user
      hadoop_instance = FactoryGirl.create :hadoop_instance, :owner => user

      event = Event.for_target(hadoop_instance).find_by_action("INSTANCE_CREATED")
      event.should_not be_nil
      event.actor.should == user
    end
  end
end
