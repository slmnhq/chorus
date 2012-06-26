require_relative '../../version'

desc 'Generate new package'
task :package do
  PackageMaker.make
end

module PackageMaker
  extend self

  ROOT_DIR = File.expand_path("../../..", __FILE__)
  PACKAGING_DIR  = File.join(ROOT_DIR, "packaging")
  PACKAGES_DIR   = File.join(PACKAGING_DIR, "packages")
  COMPONENTS_DIR = File.join(PACKAGING_DIR, "components")

  def make
    setup_directories
    archive_app
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

  def archive_app
    run "rake assets:precompile"
    run "bundle exec jetpack ."
    current_sha = head_sha
    filename = "greenplum-chorus-#{Chorus::VERSION::STRING}-#{timestamp}-#{current_sha}.tar.gz"
    files_to_tar = [
      "bin/",
      "app/",
      "config/",
      "db/",
      "doc/",
      "lib/",
      "public/",
      "script/",
      "vendor/",
      "WEB-INF/",
      "Gemfile",
      "Gemfile.lock",
      "README.md",
      "Rakefile",
      "config.ru",
      "version.rb",
      ".bundle/config"
    ]

    Dir.chdir("..") do
      run "tar czf #{filename} --exclude='chorusrails/public/system/' --exclude='javadoc' --exclude='.git' #{files_to_tar.map{|path| "chorusrails/#{path}" }.join(" ")}"
      `mv #{filename} chorusrails/`
    end

  end

  def timestamp
    Time.now.strftime("%Y%m%d-%H%M%S")
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
end
