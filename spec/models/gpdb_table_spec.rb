require "spec_helper"

describe GpdbTable do
  let(:account) { FactoryGirl.create(:instance_account) }
  let(:table) { FactoryGirl.create(:gpdb_table, :name => "clv_data") }

  describe "#analyze" do
    it "generates the correct sql" do
      fake_connection = Object.new
      mock(fake_connection).select_all("analyze \"#{table.schema.name}\".\"#{table.name}\"")
      stub(table.schema).with_gpdb_connection(account) { |_, block| block.call(fake_connection) }

      table.analyze(account)
    end
  end
end
