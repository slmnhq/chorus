module FileHelper
  def test_file(name = "small1.gif", mime = "image/gif")
    file = File.expand_path("spec/fixtures/#{name}", Rails.root)
    Rack::Test::UploadedFile.new(file, mime)
  end
end
