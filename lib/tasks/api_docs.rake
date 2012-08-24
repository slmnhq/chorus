namespace :api_docs do
  STDOUT.sync = true

  desc "Check for missing API docs"
  task :check do
    puts "Checking for missing API docs.."
    output = `script/missing_docs.rb`
    if $?.success?
      puts 'No missing API Docs'
    else
      puts output
      exit 1
    end
  end

  desc "Check and generate API docs"
  task :generate => :check do
    Rake::Task['docs:generate'].invoke
  end

  desc "Package api docs"
  task :package => "docs:generate" do
    destination_archive = File.expand_path(File.dirname(__FILE__) + '../../../doc/api_documentation.tar.gz')
    source_directory = File.expand_path(File.dirname(__FILE__) + '../../../public')
    `tar czf #{destination_archive} -C #{source_directory} api/`
  end
end

desc "Check and generate API docs"
task :api_docs => "api_docs:generate"