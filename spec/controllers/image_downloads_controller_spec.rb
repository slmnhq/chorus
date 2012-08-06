require 'spec_helper'

describe ImageDownloadsController do
  let(:user) { users(:bob) }

  before do
    log_in user
  end

  describe "#download_chart" do
    it "respond with 400 Bad Request for a malformed SVG body" do
      post :download_chart, :svg => "<bleh></bleh>"
      response.code.should == "400"
    end

    it "responds with 200 for a valid SVG document" do
      post :download_chart, :svg => '<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'chart-name' => 'achart', 'chart-type' => 'frequency'
      response.code.should == "200"
      response.headers['Content-Type'].should == 'image/png'
      response.headers['Content-Disposition'].should == 'attachment; filename="achart-frequency.png"'
    end

    it "responds with 400 bad request when no svg param is passed" do
      post :download_chart
      response.code.should == "400"
    end

    it "should apply the stylesheet visualizations.css and set the background to white" do
      # In the test environment, if assets are not precompiled,
      # download_chart will reference committed public/assets/visualizations.css,
      # which may not be the same as app/assets/visualizations.scss

      circle_picture = <<-SVG
      <svg class="chart frequency" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
       <g>
        <title>Layer 1</title>
        <rect height="10" width="10" y="5" x="5" stroke-width="0"/>
       </g>
      </svg>
      SVG

      post :download_chart, :svg => circle_picture
      response.code.should == "200"
      png = ChunkyPNG::Image.from_blob(response.body)
      ChunkyPNG::Color.to_hex(png.get_pixel(0,0)).should == "#ffffffff"
      ChunkyPNG::Color.to_hex(png.get_pixel(10,10)).should == "#4a83c3ff"
    end

  end

end
