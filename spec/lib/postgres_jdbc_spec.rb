require 'spec_helper'

describe "ActiveRecord.jdbcpostgresql_connection" do
  it "sets standard_conforming_strings to off on all db connections" do
    User.connection.execute('SHOW standard_conforming_strings').first["standard_conforming_strings"].should == "off"
    connection = User.connection_pool.checkout
    connection.execute('SHOW standard_conforming_strings').first["standard_conforming_strings"].should == "off"
    connection.disconnect!
  end
end