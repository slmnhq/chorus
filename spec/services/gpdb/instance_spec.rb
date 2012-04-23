require 'spec_helper'

describe Gpdb::Instance do
  describe ".create" do
    let(:owner) { FactoryGirl.create(:user) }
    let(:valid_attributes) do
      {
          :name => "new",
          :port => 12345,
          :host => "server.emc.com",
          :maintenance_db => "postgres"
      }
    end

    let(:invalid_attributes) do
      {
          :name => "new"
      }
    end

    before do
      connection = stub(:connected? => true)
      Gpdb::Connection.stub(:new) { connection }
    end

    context "with valid attributes" do
      it "saves the instance to the database" do
        expect {
          Gpdb::Instance.create(valid_attributes, owner)
        }.to change { Instance.count }.by(1)
      end
    end

    context "with missing attributes" do
      it "raises an error" do
        expect {
          Gpdb::Instance.create(invalid_attributes, owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "with attributes that are not valid for the connection" do
      before do
        connection = stub(:connected? => false)
        Gpdb::Connection.stub(:new) { connection }
      end

      it "raise an error" do
        expect {
          Gpdb::Instance.create(valid_attributes, owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end

      it "includes validation error about invalid connection" do
        begin
          Gpdb::Instance.create(valid_attributes, owner)
        rescue ActiveRecord::RecordInvalid => e
          e.record.errors.get(:connection).should == ["INVALID"]
        end
      end
    end
  end
end
