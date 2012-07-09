require 'spec_helper'
require 'db_types_to_chorus'



describe "DbTypesToChorus" do
  describe "#type_category" do
    before do
      class TestFubar
        include DbTypesToChorus
      end
    end

    def self.it_has_type_category(type, category)
      context "with a '#{type}' column" do
        it "has the #{category} category" do
          TestFubar.new.to_category(type).should == category
        end
      end
    end

    it_has_type_category("complex", "OTHER")
    it_has_type_category("numeric", "REAL_NUMBER")
    it_has_type_category("integer[]", "OTHER")
    it_has_type_category("bigint", "WHOLE_NUMBER")
    it_has_type_category("bigint", "WHOLE_NUMBER")
    it_has_type_category("bit(5)", "STRING")
    it_has_type_category("bit varying(10)", "STRING")
    it_has_type_category("boolean", "BOOLEAN")
    it_has_type_category("box", "OTHER")
    it_has_type_category("bytea", "BINARY")
    it_has_type_category("character varying(10)", "STRING")
    it_has_type_category("character(10)", "STRING")
    it_has_type_category("cidr", "OTHER")
    it_has_type_category("circle", "OTHER")
    it_has_type_category("date", "DATE")
    it_has_type_category("double precision", "REAL_NUMBER")
    it_has_type_category("inet", "OTHER")
    it_has_type_category("integer", "WHOLE_NUMBER")
    it_has_type_category("interval", "STRING")
    it_has_type_category("lseg", "OTHER")
    it_has_type_category("macaddr", "OTHER")
    it_has_type_category("money", "OTHER")
    it_has_type_category("numeric(5,5)", "REAL_NUMBER")
    it_has_type_category("path", "OTHER")
    it_has_type_category("point", "OTHER")
    it_has_type_category("polygon", "OTHER")
    it_has_type_category("real", "REAL_NUMBER")
    it_has_type_category("smallint", "WHOLE_NUMBER")
    it_has_type_category("integer", "WHOLE_NUMBER")
    it_has_type_category("text", "LONG_STRING")
    it_has_type_category("time without time zone", "TIME")
    it_has_type_category("time with time zone", "TIME")
    it_has_type_category("timestamp without time zone", "DATETIME")
    it_has_type_category("timestamp with time zone", "DATETIME")
  end
end