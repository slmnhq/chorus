class JsonHashSerializer
  def self.dump(hash)
    JSON.dump(hash)
  end

  def self.load(value)
    value.present? ? JSON.load(value) : {}
  end
end