require 'spec_helper'

describe User do
  it "has an initial user" do
    User.create_initial_user!("edcadmin")
    User.named("edcadmin").should be_present
  end
end
