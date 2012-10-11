require 'spec_helper'

describe Gnip::InstanceRegistrar do
  let(:owner) { users(:owner) }

  let(:instance_attributes) do
    {
        :name => "new_gnip_instance",
        :description => "some description",
        :host => "http://www.example.com",
        :username => "gnip_username",
        :password => "gnip_password"
    }
  end

  describe ".create!" do

    context "with Valid credentials" do
      before do
        any_instance_of(ChorusGnip) do |c|
          mock(c).auth { true }
        end
      end

      it "save the instance" do
        instance = Gnip::InstanceRegistrar.create!(instance_attributes, owner)

        instance.should be_persisted
        instance.name.should == "new_gnip_instance"
        instance.description.should == "some description"
        instance.host.should == "http://www.example.com"
        instance.username.should == "gnip_username"
        instance.password.should == "gnip_password"
        instance.id.should_not be_nil
        instance.should be_valid
      end

      it "makes a GnipInstanceCreated event" do
        instance = Gnip::InstanceRegistrar.create!(instance_attributes, owner)

        event = Events::GnipInstanceCreated.first
        event.gnip_instance.should == instance
        event.actor.should == owner
      end
    end

    context "With Invalid credentials" do
      before do
        any_instance_of(ChorusGnip) do |c|
          mock(c).auth { false }
        end
      end
      it "raise an error" do
        expect {
          Gnip::InstanceRegistrar.create!(instance_attributes, owner)
        }.to raise_error(ApiValidationError)
      end
    end
  end
end