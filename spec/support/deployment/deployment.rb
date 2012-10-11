module Deployment
  config_file = "config.yml"

  CONFIG = YAML.load_file(File.expand_path("../#{config_file}", __FILE__))

end