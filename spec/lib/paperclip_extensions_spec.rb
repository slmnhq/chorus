require 'spec_helper'

describe Paperclip do
  context "Processor#convert" do
    it "should resize the image" do
      f = File.expand_path("spec/fixtures/small1.gif", Rails.root) # is 5x7
      t = Tempfile.new("test_image")
      t.write(File.read(f))
      t.flush

      p = Paperclip::Processor.new(t)
      o = Tempfile.new("output_image")
      p.convert(':source -resize \"24x24>\" :dest', {:source => t.path, :dest => o.path})

      g = Paperclip::Geometry.from_file(o)
      g.width.should == 17
      g.height.should == 24
    end

    it "passes through if there is no resize argument" do
      f = File.expand_path("spec/fixtures/small1.gif", Rails.root) # is 5x7
      t = Tempfile.new("test_image")
      t.write(File.read(f))
      t.flush

      p = Paperclip::Processor.new(t)
      o = Tempfile.new("output_image")
      p.convert(':source -coalesce :dest', {:source => t.path, :dest => o.path})

      g = Paperclip::Geometry.from_file(o)
      g.width.should == 5
      g.height.should == 7
    end
  end
end
