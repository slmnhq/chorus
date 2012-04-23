require 'spec_helper'

describe Gpdb::Connection do
  subject { Gpdb::Connection.new(connection_spec) }

  context "with valid attributes" do
    let(:connection_spec) do
      {
          :name => "good_gillette",
          :port => 5432,
          :host => "gillette.sf.pivotallabs.com",
          :database => "postgres",
          :username => "gpadmin",
          :password => "secret"
      }
    end

    it { should be_connected }

    it "should share a real Postgres connection between connection instances with the same name" do
      c1 = Gpdb::Connection.new(connection_spec)
      c2 = Gpdb::Connection.new(connection_spec)
      c1.connection.should == c2.connection
    end
  end

  context "with invalid attributes" do
    let(:connection_spec) do
      {
          :name => "bad_connection",
          :port => 12345,
          :host => "notaserver.emc.com",
          :database => "postgres",
          :username => "bad_username",
          :password => "bad_pass"
      }
    end

    it { should_not be_connected }
  end
end