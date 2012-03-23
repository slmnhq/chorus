require File.expand_path("../to_from", __FILE__)

chorus_dir = File.expand_path("../../../../../../..", __FILE__)
spec_dir = 'spec/javascripts'
src_dir  = 'public/js'
spec_pattern = spec_dir + '/.*spec\.js$'
src_pattern  = src_dir + '/.*\.js$'

watch(spec_pattern) do |md|
    run "#{chorus_dir}/launch_phantom_jasmine.sh '#{md[0]}'"
end

watch(src_pattern) do |md|
    name = File.basename(md[0])
    spec_path = to_from(
        :src_dir => src_dir,
        :file_ext => '.js',
        :spec_dir => spec_dir,
        :name => name,
        :spec_suffix => '_spec'
    ).first

    run "#{chorus_dir}/launch_phantom_jasmine.sh '#{spec_path}'"
end

def run(cmd)
    puts cmd
    system cmd
end
