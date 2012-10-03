shared_examples_for "recent" do
  describe ".recent" do
    let!(:not_recent) do
      model= nil
      Timecop.freeze(8.days.ago) do
        model = FactoryGirl.create(described_class.name.underscore.gsub("events/base", "event").to_sym)
      end
      model
    end

    it "should not include comments older than 7 days" do
      described_class.recent.should_not include(not_recent)
    end
  end

end