require 'active_support/concern'
require 'rr'

module AllowyRSpecHelpers
  extend ActiveSupport::Concern

  def it_awaits_authorization(*args)
    mock(subject).authorize!(*args)
    args.count.should == 2
  end

  module ClassMethods
    def ignore_authorization!
      before(:each) do
        stub(subject).can? { true }
        stub(subject).cannot? { false }
        stub(subject).authorize! { nil }
      end
    end
  end
end
