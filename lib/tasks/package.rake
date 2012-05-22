ROOT_DIR = File.expand_path("../../..", __FILE__)
PACKAGES_DIR  = File.join(ROOT_DIR, "packaging/packages")
COMPONENTS_DIR = File.join(ROOT_DIR, "packaging/components")

EXTERNAL_DEPENDENCIES = {
  'ruby' => "http://ftp.ruby-lang.org/pub/ruby/1.9/ruby-1.9.3-p125.tar.gz",
  'rubygems' => "http://production.cf.rubygems.org/rubygems/rubygems-1.8.24.tgz",
  'hadoop' => "http://www.reverse.net/pub/apache/hadoop/common/hadoop-1.0.0/hadoop-1.0.0.tar.gz",
  'postgres' => "http://ftp.postgresql.org/pub/source/v9.0.4/postgresql-9.0.4.tar.gz",
  'imagemagick' => "http://www.imagemagick.org/download/legacy/ImageMagick-6.7.1-10.tar.gz"
}

desc 'Generate new package'
task :package do
  setup_directories
  # download_external_dependencies
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
  run "cd #{COMPONENTS_DIR} && gem fetch bundler -v 1.1.3"
end

def archive_app
  copy_dir = File.join(COMPONENTS_DIR, "app")
  compiled_assets_path = "public/assets"
  run "rm -rf #{copy_dir}" if Dir.exist?(copy_dir)
  run "git clone --depth 1 file://#{ROOT_DIR} #{copy_dir}"

  Dir.chdir(copy_dir) do
    run "rake assets:clean assets:precompile"
    run "bundle package"
  end

  run "rm -rf #{copy_dir}/.git"
  run "tar -czf #{COMPONENTS_DIR}/app.tar.gz #{copy_dir}"
  run "rm -rf #{copy_dir}"
end

def create_package
  filename = "chorus-#{head_sha}.tar.gz"
  run "tar -czf #{PACKAGES_DIR}/#{filename} #{COMPONENTS_DIR}"
end

def head_sha
  `git rev-parse head`.strip[0..8]
end

def run(cmd)
  puts cmd
  system cmd
end

