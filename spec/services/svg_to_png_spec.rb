require 'spec_helper'

describe SvgToPng do
  describe ".new" do
    subject { SvgToPng.new(svg_content) }

    context "when passed invalid SVG body" do
      let(:svg_content) { '<blah></blah>' }
      it "should raise" do
        expect { subject }.to raise_error(SvgToPng::InvalidSvgData)
      end
    end

    context "when passed a nil SVG body" do
      let(:svg_content) { nil}
      it "should raise" do
        expect { subject }.to raise_error(SvgToPng::InvalidSvgData)
      end
    end

    context "when passed a valid SVG body" do
      let(:svg_content) { '<svg xmlns="http://www.w3.org/2000/svg"></svg>' }
      it "should not raise" do
        expect { subject }.not_to raise_error
      end
    end
  end

  describe "#binary_data" do
    let(:svg_content) do
      <<-SVG
      <svg class="chart frequency" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
       <g>
        <title>Layer 1</title>
        <rect height="10" width="10" y="5" x="5" stroke-width="0"/>
       </g>
      </svg>
      SVG
    end
    let(:converter) { SvgToPng.new(svg_content)}
    subject { converter.binary_data }

    it "should apply the stylesheet visualizations.css and set the background to white" do
      # In the test environment, if assets are not precompiled,
      # download_chart will reference committed public/assets/visualizations.css,
      # which may not be the same as app/assets/visualizations.scss

      png = ChunkyPNG::Image.from_blob(subject)
      ChunkyPNG::Color.to_hex(png.get_pixel(0,0)).should == "#ffffffff"
      ChunkyPNG::Color.to_hex(png.get_pixel(10,10)).should == "#4a83c3ff"
    end
  end

  describe "#fake_uploaded_file" do
    let(:svg_content) do
      <<-SVG
      <svg class="chart frequency" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
       <g>
        <title>Layer 1</title>
        <rect height="10" width="10" y="5" x="5" stroke-width="0"/>
       </g>
      </svg>
      SVG
    end
    let(:converter) { SvgToPng.new(svg_content)}
    let(:file_name) { 'some_file.png' }
    subject { converter.fake_uploaded_file(file_name) }

    its(:original_filename) { should == file_name }
    its(:content_type) { should == 'image/png' }
    it { should be_a(StringIO) }
  end
end