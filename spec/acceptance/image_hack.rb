module RspecApiDocumentation
  class WurlWriter
    def write
       File.open(configuration.docs_dir.join("index.html"), "w+") do |f|
        f.write WurlIndex.new(index, configuration).render
      end
      index.examples.each do |example|

        # TODO: fix this horrible monkey patch
        data = example.example.metadata
        begin
          if data[:requests][0][:request_body].include?("Content-Type: image")
            addendum = "..content redacted"
            end_word = data[:requests][0][:request_body].index("Content-Length:")
            data[:requests][0][:request_body] = data[:requests][0][:request_body][0..end_word-1] + addendum
            data[:requests][0][:curl][:data] = data[:requests][0][:curl][:data][0..end_word-1] + addendum
          end
        rescue
        end

        html_example = WurlExample.new(example, configuration)
        FileUtils.mkdir_p(configuration.docs_dir.join(html_example.dirname))
        File.open(configuration.docs_dir.join(html_example.dirname, html_example.filename), "w+") do |f|
          content = html_example.render
          f.write content
        end
      end
    end
  end
end
