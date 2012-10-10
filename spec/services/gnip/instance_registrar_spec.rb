require 'spec_helper'

describe Gnip::InstanceRegistrar do
  let(:owner) { users(:owner) }

  let(:instance_attributes) do
    {
        :name => "new_gnip_instance",
        :description => "some description",
        :port => 12345,
        :host => "server.gnip.com",
        :username => "gnip_user",
        :password => "secret"
    }
  end

  describe ".create!" do

    context "when a connection is made" do
      it "save the instance" do
        instance = Gnip::InstanceRegistrar.create!(instance_attributes, owner)

        instance.name.should == "new_gnip_instance"
        instance.id.should_not be_nil
        instance.should be_valid
      end

      it "makes a HadoopInstanceCreated event"
      #  instance = Gnip::InstanceRegistrar.create!(instance_attributes, owner)
      #
      #  event = Events::GnipInstanceCreated.first
      #  event.gnip_instance.should == instance
      #  event.actor.should == owner
      #end
    end
  end
end