ROOT_DIR = File.expand_path("../../..", __FILE__)
PACKAGING_DIR  = File.join(ROOT_DIR, "packaging")
PACKAGES_DIR   = File.join(PACKAGING_DIR, "packages")
COMPONENTS_DIR = File.join(PACKAGING_DIR, "components")

EXTERNAL_DEPENDENCIES = {
  'ruby' => "http://greenplum-ci.sf.pivotallabs.com/~ci/chorus_packaging_mirror/ruby-1.9.3-p125.tar.gz",
  'rubygems' => "http://greenplum-ci.sf.pivotallabs.com/~ci/chorus_packaging_mirror/rubygems-1.8.24.tgz",
  # 'hadoop' => "http://www.reverse.net/pub/apache/hadoop/common/hadoop-1.0.0/hadoop-1.0.0.tar.gz",
  'postgres' => "http://greenplum-ci.sf.pivotallabs.com/~ci/chorus_packaging_mirror/postgresql-9.0.4.tar.gz",
  'imagemagick' => "http://greenplum-ci.sf.pivotallabs.com/~ci/chorus_packaging_mirror/ImageMagick-6.7.1-10.tar.gz"
}

desc 'Generate new package'
task :package do
  setup_directories
  download_external_dependencies
  download_bundler
  archive_app
  create_package
end

def setup_directories
  run "mkdir -p #{COMPONENTS_DIR}"
  run "mkdir -p #{PACKAGES_DIR}"
end

def check_clean_working_tree
  unless system('git diff-files --quiet')
    puts "You have a dirty working tree. You must stash or commit your changes before packaging."
    exit
  end
end

def download_external_dependencies
  EXTERNAL_DEPENDENCIES.each do |name, url|
    run "curl #{url} > #{COMPONENTS_DIR}/#{name}"
  end
end

def download_bundler
  Dir.chdir(COMPONENTS_DIR) do
    run "gem fetch bundler -v 1.1.3"
  end
end

def archive_app
  copy_name = "app"

  Dir.chdir(COMPONENTS_DIR) do
    compiled_assets_path = "public/assets"
    run "rm -rf #{copy_name}" if Dir.exist?(copy_name)
    run "git clone --depth 1 file://#{ROOT_DIR} #{copy_name}"

    Dir.chdir(File.join(COMPONENTS_DIR, copy_name)) do
      run "rake assets:clean assets:precompile"
      run "bundle package"
    end

    run "tar -czf #{COMPONENTS_DIR}/app.tar.gz #{copy_name}"
    run "rm -rf #{copy_name}"
  end
end

def create_package
  Dir.chdir(PACKAGING_DIR) do
    filename = "chorus-#{head_sha}.tar.gz"
    run "tar -czf #{PACKAGES_DIR}/#{filename} #{relative(COMPONENTS_DIR)} install.rb"
  end
end

def head_sha
  `git rev-parse head`.strip[0..8]
end

def run(cmd)
  puts cmd
  system cmd
end

def relative(path)
  current = Pathname.new(Dir.pwd)
  Pathname.new(path).relative_path_from(current).to_s
end
