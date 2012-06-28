require "spec_helper"
require_relative "helpers"

describe "Notes" do
  extend EventHelpers

  let(:actor) { FactoryGirl.create(:user) }
  let(:greenplum_instance) { FactoryGirl.create(:instance) }

  describe "NOTE_ON_GREENPLUM_INSTANCE" do
    subject do
      Events::NOTE_ON_GREENPLUM_INSTANCE.add(
          :actor => actor,
          :greenplum_instance => greenplum_instance,
          :body => "This is the body"
      )
    end

    its(:greenplum_instance) { should == greenplum_instance }
    its(:targets) { should == {:greenplum_instance => greenplum_instance} }
    its(:additional_data) { should == {:body => "This is the body"} }

    it_creates_activities_for { [actor, greenplum_instance] }
    it_creates_a_global_activity
  end
end
