require File.expand_path("../to_from", __FILE__)

CHORUS_DIR ||= File.expand_path("../../../../../../..", __FILE__)
SPEC_DIR ||= 'spec/javascripts'
SRC_DIR  ||= 'public/js'
SPEC_PATTERN ||= SPEC_DIR + '/.*spec\.js$'
SRC_PATTERN  ||= SRC_DIR + '/.*\.js$'

watch(SPEC_PATTERN) do |md|
    puts "Detected change to #{md[0]}"
    run_spec md[0]
end

watch(SRC_PATTERN) do |md|
    puts "Detected change to #{md[0]}"
    name = File.basename(md[0])
    spec_path = to_from(
        :src_dir => SRC_DIR,
        :file_ext => '.js',
        :spec_dir => SPEC_DIR,
        :name => name,
        :spec_suffix => '_spec'
    ).first
    run_spec spec_path
end


def run_spec(spec_path)
    if spec_path.nil?
        puts "No spec found, not running anything"
        return
    end

    puts "Running #{spec_path}"
    system "#{CHORUS_DIR}/launch_phantom_jasmine.sh '#{spec_path}'"
    puts
end
