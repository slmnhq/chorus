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
      exit
    end
  end

  desc "Check and generate API docs"
  task :generate => :check do
    Rake::Task['docs:generate'].invoke
  end
end

desc "Check and generate API docs"
task :api_docs => "api_docs:generate"