namespace :api_docs do
  STDOUT.sync = true

  desc "Run the API docs and make sure every route has one"
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

  task :generate => :check do
    Rake::Task['docs:generate'].invoke
  end
end

task :api_docs => "api_docs:generate"