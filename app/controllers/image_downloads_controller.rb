require Rails.root + 'vendor/batik-all-1.7.jar'
require Rails.root + 'vendor/xml-apis-ext-1.3.04.jar'

class ImageDownloadsController < ApplicationController
  def download_chart
    transcoder_class = org.apache.batik.transcoder.image.PNGTranscoder

    input = org.apache.batik.transcoder.TranscoderInput.new(org.jruby.util.IOInputStream.new(StringIO.new(params[:svg])))

    ostream = java.io.ByteArrayOutputStream.new
    output = org.apache.batik.transcoder.TranscoderOutput.new(ostream)

    transcoder = transcoder_class.new
    transcoder.addTranscodingHint(transcoder_class::KEY_BACKGROUND_COLOR, java.awt.Color::WHITE)
    transcoder.addTranscodingHint(transcoder_class::KEY_USER_STYLESHEET_URI, "file://" + Rails.root.join("public/assets/visualizations.css").to_s)
    transcoder.transcode(input, output)

    send_data String.from_java_bytes(ostream.to_byte_array), :type => 'image/png', :filename => "#{params["chart-name"]}-#{params["chart-type"]}.png"
  rescue TypeError, org.apache.batik.transcoder.TranscoderException
    head 400
  end
end