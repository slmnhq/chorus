require "paperclip"
require Rails.root + 'vendor/imgscalr-lib-4.2.jar'

# These methods are taken from the class Paperclip::FileAdapter
# Rather than trusting the browser's content-type, we want to
# check it on the server. There is an open pull request for this
# here:
#
# https://github.com/thoughtbot/paperclip/pull/869
#
module Paperclip
  class UploadedFileAdapter
    def content_type
      types = MIME::Types.type_for(original_filename)
      if types.length == 0
        type_from_file_command
      elsif types.length == 1
        types.first.content_type
      else
        best_content_type_option(types)
      end
    end

    private

    def best_content_type_option(types)
      matched_types = types.reject {|type| type.content_type.match(/\/x-/) }
      matched_types.first.content_type if matched_types.first.present?
    end

    def type_from_file_command
      # On BSDs, `file` doesn't give a result code of 1 if the file doesn't exist.
      type = (self.original_filename.match(/\.(\w+)$/)[1] rescue "octet-stream").downcase
      mime_type = (Paperclip.run("file", "-b --mime :file", :file => self.path).split(/[:;\s]+/)[0] rescue "application/x-#{type}")
      mime_type = "application/x-#{type}" if mime_type.match(/\(.*?\)/)
      mime_type
    end
  end

  class Geometry
    def self.from_file file
      file_path = file.respond_to?(:path) ? file.path : file
      raise(Errors::NotIdentifiedByImageMagickError.new("Cannot find the geometry of a file with a blank name")) if file_path.blank?

      img = javax.imageio.ImageIO.read(java.io.File.new(file_path))
      raise(Errors::NotIdentifiedByImageMagickError.new("#{file_path} is not recognized by ImageIO.read")) unless img

      parse("#{img.getWidth}x#{img.getHeight}")
    end
  end

  class Processor
    def convert(arguments = "", local_options = {})
      # Remove the [0] for the first frame - no animations supported (ImageMagick will use this for GIFs)
      img = javax.imageio.ImageIO.read(java.io.File.new(local_options[:source].gsub("[0]","")))

      output_file = java.io.File.new(local_options[:dest])

      m = arguments.match /-resize \"(\d+)x(\d+)>\"/
      if m && m[1] && m[2]
        img = Java::OrgImgscalr::Scalr.resize(img, m[1].to_i, m[2].to_i, nil)
      end
      javax.imageio.ImageIO.write(img, "png", output_file)
    end

    def identify(arguments = "", local_options = {})
      raise NotImplementedError, "Processor#identify is unimplemented since we don't use ImageMagick."
    end
  end

  class Thumbnail
    def identified_as_animated?
      raise NotImplementedError, "identified_as_animated is unimplemented since we don't use ImageMagick."
    end
  end
end

Paperclip.interpolates :note_id do |attachment, style|
  attachment.instance.note_id
end