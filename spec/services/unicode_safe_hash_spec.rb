# encoding: utf-8
require 'spec_helper'

describe UnicodeSafeHash do
  let(:dump_yaml) do
    <<-YAML
---
body: foo’s text
extra:
  more: foo
...
    YAML
  end
  let(:dump_hash) { {:body => "foo’s text", :extra => {:more => "foo"}} }

  it "should dump unicode character correctly" do
    dump = UnicodeSafeHash.dump(dump_hash)
    dump.should == dump_yaml
  end

  it "should load unicode characters correctly" do
    hash = UnicodeSafeHash.load(dump_yaml)
    hash.should == dump_hash
  end
end