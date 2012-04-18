require 'spec_helper'

describe InstancesController do
  before do
    log_in FactoryGirl.create(:user)
    @instance1 = FactoryGirl.create(:instance)
    @instance2 = FactoryGirl.create(:instance)
  end

  it "#index" do
    get :index
    response.code.should == "200"
    decoded_response.length.should == 2

    decoded_response[0].name.should == @instance1.name
    decoded_response[0].host.should == @instance1.host
    decoded_response[0].port.should == @instance1.port
    decoded_response[0].id.should == @instance1.id

    decoded_response[1].name.should == @instance2.name
    decoded_response[1].host.should == @instance2.host
    decoded_response[1].port.should == @instance2.port
    decoded_response[1].id.should == @instance2.id
  end
end