require "paperclip"

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
      types.reject {|type| type.content_type.match(/\/x-/) }.first.content_type
    end

    def type_from_file_command
      # On BSDs, `file` doesn't give a result code of 1 if the file doesn't exist.
      type = (self.original_filename.match(/\.(\w+)$/)[1] rescue "octet-stream").downcase
      mime_type = (Paperclip.run("file", "-b --mime :file", :file => self.path).split(/[:;\s]+/)[0] rescue "application/x-#{type}")
      mime_type = "application/x-#{type}" if mime_type.match(/\(.*?\)/)
      mime_type
    end
  end
end
