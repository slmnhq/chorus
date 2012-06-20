require "spec_helper"

describe Instance, :type => :database_integration do
  let(:account) { refresh_chorus }

  subject { account.instance }

  it "should not include the 'template0' database" do
    subject.databases.map(&:name).tap{|x| puts x}.should_not include "template0"
  end
end