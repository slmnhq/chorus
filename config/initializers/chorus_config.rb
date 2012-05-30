Chorus::Application.config.chorus = YAML.load_file("#{Rails.root}/config/chorus.yml")[Rails.env]
