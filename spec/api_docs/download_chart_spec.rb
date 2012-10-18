require 'spec_helper'

resource "Visualizations" do
  let(:user) { users(:admin) }

  before do
    log_in user
  end

  post "/download_chart" do
    parameter :svg, "Content of an SVG file"
    parameter :'chart-name', "Name of the dataset being charted"
    parameter :'chart-type', "Type of chart"

    required_parameters :svg, :'chart-name', :'chart-type'

    let(:svg) { File.read(File.expand_path("spec/fixtures/SVG-logo.svg", Rails.root)) }

    example_request "Download a rendered SVG visualization as png" do
      explanation <<-DESC
        The uploaded SVG file is converted into a PNG and downloaded.
        The supplied file name and chart type parameters are used to generate the default file name,
        which is '<chart-name>-<chart-type>.png'.
      DESC

      status.should == 200
    end
  end
end
