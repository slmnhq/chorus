require 'queue_classic'

class AddQueueClassicTable < ActiveRecord::Migration
  def self.up
    QC::Setup.create
  end

  def self.down
    QC::Setup.drop
  end
end