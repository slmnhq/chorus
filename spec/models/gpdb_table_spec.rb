require "spec_helper"

describe GpdbTable do
  let(:table) { datasets(:table) }
  let(:account) { table.schema.database.gpdb_instance.owner_account }

  describe "#analyze" do
    it "generates the correct sql" do
      fake_connection = Object.new
      mock(fake_connection).exec_query("analyze \"#{table.schema.name}\".\"#{table.name}\"")
      stub(table.schema).with_gpdb_connection(account) { |_, block| block.call(fake_connection) }

      table.analyze(account)
    end
  end
end
