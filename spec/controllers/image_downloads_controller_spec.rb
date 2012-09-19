require 'spec_helper'

describe ImageDownloadsController do
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  describe "#download_chart" do
    it "respond with 400 Bad Request when the SVG can't be transcoded" do
      mock(SvgToPng).new(anything) { raise SvgToPng::InvalidSvgData }
      post :download_chart, :svg => "<bleh></bleh>"
      response.code.should == "400"
    end

    it "responds with 200 for a valid SVG document" do
      post :download_chart, :svg => '<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'chart-name' => 'achart', 'chart-type' => 'frequency'
      response.code.should == "200"
      response.headers['Content-Type'].should == 'image/png'
      response.headers['Content-Disposition'].should == 'attachment; filename="achart-frequency.png"'
    end
  end
end
