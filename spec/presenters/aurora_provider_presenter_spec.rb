require 'spec_helper'

describe AuroraProviderPresenter, :type => :view do
  before(:each) do
    aurora_service = Object.new
    mock(aurora_service).provider_status { "install_succeed" }

    @aurora_provider = AuroraProvider.new(aurora_service)
    @presenter = AuroraProviderPresenter.new(@aurora_provider, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes status" do
      @hash[:install_succeed].should be_true
    end
  end
end
