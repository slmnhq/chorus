require 'spec_helper'

describe AuroraProviderPresenter, :type => :view do
  context "when the aurora is configured properly" do
    before do
      aurora_service = Object.new
      mock(aurora_service).valid? { true }
      mock(aurora_service).templates { [Aurora::Template.new(Aurora::DB_SIZE[:small])] }

      @aurora_provider = AuroraProvider.new(aurora_service)
      @presenter = AuroraProviderPresenter.new(@aurora_provider, view)
      @hash = @presenter.to_hash
    end

    it "includes status" do
      @hash[:install_succeed].should be_true
      @hash[:templates].should be_present
      @hash[:templates].first[:name].should be_present
    end
  end
  context "when aurora is not configured" do
    before do
      aurora_service = Object.new
      mock(aurora_service).valid? { false }
      mock(aurora_service).templates { [] }

      @aurora_provider = AuroraProvider.new(aurora_service)
      @presenter = AuroraProviderPresenter.new(@aurora_provider, view)
      @hash = @presenter.to_hash
    end

    it "includes status but template should be empty" do
      @hash[:install_succeed].should be_false
      @hash[:templates].should be_empty
    end
  end
end
