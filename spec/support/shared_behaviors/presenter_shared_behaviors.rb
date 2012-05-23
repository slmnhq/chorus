shared_examples "sanitized presenter" do |factory_name, *fields_to_sanitize|
  fields_to_sanitize.each do |field_to_sanitize|
    it "sanitizes #{field_to_sanitize}" do
      bad_value = "<script>alert('got your cookie')</script>"

      presented = FactoryGirl.build factory_name, field_to_sanitize => bad_value
      json = described_class.new(presented, view).to_hash

      json[field_to_sanitize].should_not match "<"
    end
  end
end
