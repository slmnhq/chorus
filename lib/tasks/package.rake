require_relative '../../version'

desc 'Generate new package'
task :package do
  PackageMaker.make
end

task :stage do
  PackageMaker.make(:stage => true)
end

module PackageMaker
  extend self

  ROOT_DIR = File.expand_path("../../..", __FILE__)
  PACKAGING_DIR  = File.join(ROOT_DIR, "packaging")
  PACKAGES_DIR   = File.join(PACKAGING_DIR, "packages")
  COMPONENTS_DIR = File.join(PACKAGING_DIR, "components")

  def stage(filename)
    run "ssh chorus-staging 'cd ~/chorusrails; RAILS_ENV=production script/server_control.sh stop'"

    run "scp #{filename} chorus-staging:~/"
    run "ssh chorus-staging 'cd ~/; tar --overwrite -xvf #{filename}'"
    # Run the migrations
    run "ssh chorus-staging 'cd ~/chorusrails; RAILS_ENV=production bin/rake db:migrate'"
    run "ssh chorus-staging 'cd ~/chorusrails; RAILS_ENV=production script/server_control.sh start'"
  end

  def make(options = {})
    current_sha = head_sha
    filename = "greenplum-chorus-#{Chorus::VERSION::STRING}-#{timestamp}-#{current_sha}.tar.gz"
    setup_directories
    archive_app(filename, current_sha)
    if options[:stage]
      stage(filename)
    end
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

  def archive_app(filename, sha)
    check_clean_working_tree
    run "RAILS_ENV=development rake assets:precompile"
    run "bundle exec jetpack ."
    File.open('version_build', 'w') do |f|
      f.puts sha
    end

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
      "version_build",
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
